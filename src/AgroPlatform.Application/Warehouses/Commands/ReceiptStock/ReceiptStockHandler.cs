using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Extensions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Enums;
using AgroPlatform.Domain.Warehouses;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Warehouses.Commands.ReceiptStock;

public class ReceiptStockHandler : IRequestHandler<ReceiptStockCommand, Guid>
{
    private readonly IAppDbContext _context;
    private readonly IDateTimeService _dateTime;
    private readonly IStockBalanceService _stockBalance;
    private readonly IUnitConversionService _unitConversion;

    public ReceiptStockHandler(
        IAppDbContext context,
        IDateTimeService dateTime,
        IStockBalanceService stockBalance,
        IUnitConversionService unitConversion)
    {
        _context = context;
        _dateTime = dateTime;
        _stockBalance = stockBalance;
        _unitConversion = unitConversion;
    }

    public async Task<Guid> Handle(ReceiptStockCommand request, CancellationToken cancellationToken)
    {
        await using var tx = await _context.Database.BeginRepeatableReadTransactionIfSupportedAsync(cancellationToken);

        // Idempotency check
        if (!string.IsNullOrEmpty(request.ClientOperationId))
        {
            var existing = await _context.StockMoves
                .FirstOrDefaultAsync(m => m.ClientOperationId == request.ClientOperationId, cancellationToken);
            if (existing != null)
            {
                if (tx is not null)
                {
                    await tx.CommitAsync(cancellationToken);
                }

                return existing.Id;
            }
        }

        var warehouse = await _context.Warehouses.FindAsync(new object[] { request.WarehouseId }, cancellationToken)
            ?? throw new NotFoundException(nameof(Warehouse), request.WarehouseId);

        warehouse.EnsureActive();

        var item = await _context.WarehouseItems.FindAsync(new object[] { request.ItemId }, cancellationToken)
            ?? throw new NotFoundException(nameof(WarehouseItem), request.ItemId);

        // Update purchase price from latest receipt
        if (request.PricePerUnit.HasValue && request.PricePerUnit.Value > 0)
        {
            item.PurchasePrice = request.PricePerUnit.Value;
        }

        var batchId = request.BatchId;

        if (batchId == null && !string.IsNullOrEmpty(request.BatchCode))
        {
            var batch = new Batch
            {
                Code = request.BatchCode,
                ItemId = request.ItemId,
                ReceivedDate = request.ReceivedDate ?? _dateTime.UtcNow,
                ExpiryDate = request.ExpiryDate,
                SupplierName = request.SupplierName,
                CostPerUnit = request.CostPerUnit ?? request.PricePerUnit,
            };
            _context.Batches.Add(batch);
            batchId = batch.Id;
        }

        // Convert requested quantity to item's base unit for balance accounting.
        var quantityBase = await _unitConversion.ConvertAsync(
            request.Quantity, request.UnitCode, item.BaseUnit, cancellationToken);

        var move = new StockMove
        {
            WarehouseId = request.WarehouseId,
            ItemId = request.ItemId,
            BatchId = batchId,
            MoveType = StockMoveType.Receipt,
            Quantity = request.Quantity,      // original requested quantity
            UnitCode = request.UnitCode,      // original requested unit
            QuantityBase = quantityBase,      // converted to item base unit
            Note = request.Note,
            ClientOperationId = request.ClientOperationId,
            TotalCost = request.PricePerUnit.HasValue
                ? Math.Round(request.Quantity * request.PricePerUnit.Value, 2)
                : (decimal?)null,
        };

        _context.StockMoves.Add(move);

        var balanceAfter = await _stockBalance.IncreaseBalance(request.WarehouseId, request.ItemId, batchId, quantityBase, item.BaseUnit, cancellationToken);

        _context.StockLedgerEntries.Add(new StockLedgerEntry
        {
            WarehouseId     = request.WarehouseId,
            ItemId          = request.ItemId,
            BatchId         = batchId,
            StockMoveId     = move.Id,
            DocumentRef     = request.ClientOperationId,
            MoveType        = StockMoveType.Receipt,
            Quantity        = request.Quantity,
            UnitCode        = request.UnitCode,
            QuantityBase    = quantityBase,           // positive — stock in
            BaseUnit        = item.BaseUnit,
            BalanceAfterBase = balanceAfter,
            TotalCost       = move.TotalCost,
            Note            = request.Note,
            CreatedAtUtc    = _dateTime.UtcNow,
        });

        try
        {
            await _context.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            throw new ConflictException("A concurrent update was detected on the stock balance. Please retry the operation.");
        }

        if (tx is not null)
        {
            await tx.CommitAsync(cancellationToken);
        }

        return move.Id;
    }
}
