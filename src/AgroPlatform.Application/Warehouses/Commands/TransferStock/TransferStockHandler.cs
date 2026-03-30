using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Extensions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Enums;
using AgroPlatform.Domain.Warehouses;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Warehouses.Commands.TransferStock;

public class TransferStockHandler : IRequestHandler<TransferStockCommand, Guid>
{
    private readonly IAppDbContext _context;
    private readonly IDateTimeService _dateTime;
    private readonly IStockBalanceService _stockBalance;
    private readonly IUnitConversionService _unitConversion;

    public TransferStockHandler(
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

    public async Task<Guid> Handle(TransferStockCommand request, CancellationToken cancellationToken)
    {
        if (request.SourceWarehouseId == request.DestinationWarehouseId)
            throw new ConflictException("Source and destination warehouses must be different.");

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

                return existing.OperationId ?? existing.Id;
            }
        }

        var sourceWarehouse = await _context.Warehouses.FindAsync(new object[] { request.SourceWarehouseId }, cancellationToken)
            ?? throw new NotFoundException(nameof(Warehouse), request.SourceWarehouseId);

        if (!sourceWarehouse.IsActive)
            throw new ConflictException($"Source warehouse '{sourceWarehouse.Name}' is not active.");

        var destWarehouse = await _context.Warehouses.FindAsync(new object[] { request.DestinationWarehouseId }, cancellationToken)
            ?? throw new NotFoundException(nameof(Warehouse), request.DestinationWarehouseId);

        if (!destWarehouse.IsActive)
            throw new ConflictException($"Destination warehouse '{destWarehouse.Name}' is not active.");

        var item = await _context.WarehouseItems.FindAsync(new object[] { request.ItemId }, cancellationToken)
            ?? throw new NotFoundException(nameof(WarehouseItem), request.ItemId);

        // Convert requested quantity to item's base unit for balance accounting.
        var quantityBase = await _unitConversion.ConvertAsync(
            request.Quantity, request.UnitCode, item.BaseUnit, cancellationToken);

        var operationId = Guid.NewGuid();

        var transferOut = new StockMove
        {
            WarehouseId = request.SourceWarehouseId,
            ItemId = request.ItemId,
            BatchId = request.BatchId,
            OperationId = operationId,
            MoveType = StockMoveType.TransferOut,
            Quantity = request.Quantity,   // original requested quantity
            UnitCode = request.UnitCode,   // original requested unit
            QuantityBase = quantityBase,   // converted to item base unit
            Note = request.Note,
            ClientOperationId = request.ClientOperationId
        };

        var transferIn = new StockMove
        {
            WarehouseId = request.DestinationWarehouseId,
            ItemId = request.ItemId,
            BatchId = request.BatchId,
            OperationId = operationId,
            MoveType = StockMoveType.TransferIn,
            Quantity = request.Quantity,   // original requested quantity
            UnitCode = request.UnitCode,   // original requested unit
            QuantityBase = quantityBase,   // converted to item base unit
            Note = request.Note
        };

        _context.StockMoves.Add(transferOut);
        _context.StockMoves.Add(transferIn);

        var sourceBalanceAfter = await _stockBalance.DecreaseBalance(request.SourceWarehouseId, request.ItemId, request.BatchId, quantityBase, cancellationToken);
        var destBalanceAfter   = await _stockBalance.IncreaseBalance(request.DestinationWarehouseId, request.ItemId, request.BatchId, quantityBase, item.BaseUnit, cancellationToken);

        var now = _dateTime.UtcNow;
        _context.StockLedgerEntries.Add(new StockLedgerEntry
        {
            WarehouseId      = request.SourceWarehouseId,
            ItemId           = request.ItemId,
            BatchId          = request.BatchId,
            StockMoveId      = transferOut.Id,
            OperationId      = operationId,
            DocumentRef      = request.ClientOperationId,
            MoveType         = StockMoveType.TransferOut,
            Quantity         = request.Quantity,
            UnitCode         = request.UnitCode,
            QuantityBase     = -quantityBase,         // negative — leaving source
            BaseUnit         = item.BaseUnit,
            BalanceAfterBase = sourceBalanceAfter,
            Note             = request.Note,
            CreatedAtUtc     = now,
        });
        _context.StockLedgerEntries.Add(new StockLedgerEntry
        {
            WarehouseId      = request.DestinationWarehouseId,
            ItemId           = request.ItemId,
            BatchId          = request.BatchId,
            StockMoveId      = transferIn.Id,
            OperationId      = operationId,
            DocumentRef      = request.ClientOperationId,
            MoveType         = StockMoveType.TransferIn,
            Quantity         = request.Quantity,
            UnitCode         = request.UnitCode,
            QuantityBase     = quantityBase,          // positive — entering destination
            BaseUnit         = item.BaseUnit,
            BalanceAfterBase = destBalanceAfter,
            Note             = request.Note,
            CreatedAtUtc     = now,
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

        return operationId;
    }
}
