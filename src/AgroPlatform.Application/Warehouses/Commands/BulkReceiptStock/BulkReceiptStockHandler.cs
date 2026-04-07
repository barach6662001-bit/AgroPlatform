using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Extensions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Enums;
using AgroPlatform.Domain.Warehouses;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Warehouses.Commands.BulkReceiptStock;

public class BulkReceiptStockHandler : IRequestHandler<BulkReceiptStockCommand, BulkReceiptStockResultDto>
{
    private readonly IAppDbContext _context;
    private readonly IDateTimeService _dateTime;
    private readonly IStockBalanceService _stockBalance;
    private readonly IUnitConversionService _unitConversion;

    public BulkReceiptStockHandler(
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

    public async Task<BulkReceiptStockResultDto> Handle(BulkReceiptStockCommand request, CancellationToken cancellationToken)
    {
        await using var tx = await _context.Database.BeginRepeatableReadTransactionIfSupportedAsync(cancellationToken);

        // Idempotency check on the whole bulk operation
        if (!string.IsNullOrEmpty(request.ClientOperationId))
        {
            var existing = await _context.StockMoves
                .FirstOrDefaultAsync(m => m.ClientOperationId == request.ClientOperationId, cancellationToken);
            if (existing != null)
            {
                if (tx is not null) await tx.CommitAsync(cancellationToken);
                return new BulkReceiptStockResultDto(0, 0, new List<BulkReceiptLineResultDto>());
            }
        }

        var warehouse = await _context.Warehouses.FindAsync(new object[] { request.WarehouseId }, cancellationToken)
            ?? throw new NotFoundException(nameof(Warehouse), request.WarehouseId);

        warehouse.EnsureActive();

        var results = new List<BulkReceiptLineResultDto>();
        var successCount = 0;
        var isFirst = true;

        foreach (var line in request.Lines)
        {
            try
            {
                var item = await _context.WarehouseItems.FindAsync(new object[] { line.ItemId }, cancellationToken)
                    ?? throw new NotFoundException(nameof(WarehouseItem), line.ItemId);

                if (line.PricePerUnit.HasValue && line.PricePerUnit.Value > 0)
                {
                    item.PurchasePrice = line.PricePerUnit.Value;
                }

                Guid? batchId = null;
                if (!string.IsNullOrEmpty(line.BatchCode))
                {
                    var batch = new Batch
                    {
                        Code = line.BatchCode,
                        ItemId = line.ItemId,
                        ReceivedDate = line.ReceivedDate ?? _dateTime.UtcNow,
                        ExpiryDate = line.ExpiryDate,
                        SupplierName = line.SupplierName,
                        CostPerUnit = line.PricePerUnit,
                    };
                    _context.Batches.Add(batch);
                    batchId = batch.Id;
                }

                var quantityBase = await _unitConversion.ConvertAsync(
                    line.Quantity, line.UnitCode, item.BaseUnit, cancellationToken);

                // Only the first line carries the ClientOperationId for idempotency
                var lineClientOpId = isFirst ? request.ClientOperationId : null;
                isFirst = false;

                var move = new StockMove
                {
                    WarehouseId = request.WarehouseId,
                    ItemId = line.ItemId,
                    BatchId = batchId,
                    MoveType = StockMoveType.Receipt,
                    Quantity = line.Quantity,
                    UnitCode = line.UnitCode,
                    QuantityBase = quantityBase,
                    Note = line.Note,
                    ClientOperationId = lineClientOpId,
                    TotalCost = line.PricePerUnit.HasValue
                        ? Math.Round(line.Quantity * line.PricePerUnit.Value, 2)
                        : (decimal?)null,
                };

                _context.StockMoves.Add(move);

                var balanceAfter = await _stockBalance.IncreaseBalance(
                    request.WarehouseId, line.ItemId, batchId, quantityBase, item.BaseUnit, cancellationToken);

                _context.StockLedgerEntries.Add(new StockLedgerEntry
                {
                    WarehouseId = request.WarehouseId,
                    ItemId = line.ItemId,
                    BatchId = batchId,
                    StockMoveId = move.Id,
                    DocumentRef = lineClientOpId,
                    MoveType = StockMoveType.Receipt,
                    Quantity = line.Quantity,
                    UnitCode = line.UnitCode,
                    QuantityBase = quantityBase,
                    BaseUnit = item.BaseUnit,
                    BalanceAfterBase = balanceAfter,
                    TotalCost = move.TotalCost,
                    Note = line.Note,
                    CreatedAtUtc = _dateTime.UtcNow,
                });

                results.Add(new BulkReceiptLineResultDto(line.ItemId, move.Id, true, null));
                successCount++;
            }
            catch (Exception ex)
            {
                results.Add(new BulkReceiptLineResultDto(line.ItemId, null, false, ex.Message));
            }
        }

        if (successCount > 0)
        {
            await _context.SaveChangesAsync(cancellationToken);
        }

        if (tx is not null) await tx.CommitAsync(cancellationToken);

        return new BulkReceiptStockResultDto(request.Lines.Count, successCount, results);
    }
}
