using AgroPlatform.Application.Common.Exceptions;
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

    public TransferStockHandler(IAppDbContext context, IDateTimeService dateTime)
    {
        _context = context;
        _dateTime = dateTime;
    }

    public async Task<Guid> Handle(TransferStockCommand request, CancellationToken cancellationToken)
    {
        if (request.SourceWarehouseId == request.DestinationWarehouseId)
            throw new ConflictException("Source and destination warehouses must be different.");

        var sourceWarehouse = await _context.Warehouses.FindAsync(new object[] { request.SourceWarehouseId }, cancellationToken)
            ?? throw new NotFoundException(nameof(Warehouse), request.SourceWarehouseId);

        if (!sourceWarehouse.IsActive)
            throw new ConflictException($"Source warehouse '{sourceWarehouse.Name}' is not active.");

        var destWarehouse = await _context.Warehouses.FindAsync(new object[] { request.DestinationWarehouseId }, cancellationToken)
            ?? throw new NotFoundException(nameof(Warehouse), request.DestinationWarehouseId);

        if (!destWarehouse.IsActive)
            throw new ConflictException($"Destination warehouse '{destWarehouse.Name}' is not active.");

        _ = await _context.WarehouseItems.FindAsync(new object[] { request.ItemId }, cancellationToken)
            ?? throw new NotFoundException(nameof(WarehouseItem), request.ItemId);

        var sourceBalance = await _context.StockBalances
            .FirstOrDefaultAsync(b =>
                b.WarehouseId == request.SourceWarehouseId &&
                b.ItemId == request.ItemId &&
                b.BatchId == request.BatchId,
                cancellationToken);

        if (sourceBalance == null || sourceBalance.BalanceBase < request.Quantity)
            throw new ConflictException("Insufficient stock balance in source warehouse.");

        var operationId = Guid.NewGuid();
        var now = _dateTime.UtcNow;

        var transferOut = new StockMove
        {
            WarehouseId = request.SourceWarehouseId,
            ItemId = request.ItemId,
            BatchId = request.BatchId,
            OperationId = operationId,
            MoveType = StockMoveType.TransferOut,
            Quantity = request.Quantity,
            UnitCode = request.UnitCode,
            QuantityBase = request.Quantity,
            Note = request.Note
        };

        var transferIn = new StockMove
        {
            WarehouseId = request.DestinationWarehouseId,
            ItemId = request.ItemId,
            BatchId = request.BatchId,
            OperationId = operationId,
            MoveType = StockMoveType.TransferIn,
            Quantity = request.Quantity,
            UnitCode = request.UnitCode,
            QuantityBase = request.Quantity,
            Note = request.Note
        };

        _context.StockMoves.Add(transferOut);
        _context.StockMoves.Add(transferIn);

        // Update source balance
        sourceBalance.BalanceBase -= request.Quantity;
        sourceBalance.LastUpdatedUtc = now;

        // Upsert destination balance
        var destBalance = await _context.StockBalances
            .FirstOrDefaultAsync(b =>
                b.WarehouseId == request.DestinationWarehouseId &&
                b.ItemId == request.ItemId &&
                b.BatchId == request.BatchId,
                cancellationToken);

        if (destBalance == null)
        {
            destBalance = new StockBalance
            {
                WarehouseId = request.DestinationWarehouseId,
                ItemId = request.ItemId,
                BatchId = request.BatchId,
                BalanceBase = request.Quantity,
                BaseUnit = request.UnitCode,
                LastUpdatedUtc = now
            };
            _context.StockBalances.Add(destBalance);
        }
        else
        {
            destBalance.BalanceBase += request.Quantity;
            destBalance.LastUpdatedUtc = now;
        }

        await _context.SaveChangesAsync(cancellationToken);
        return operationId;
    }
}
