using AgroPlatform.Application.Common.Exceptions;
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

    public ReceiptStockHandler(IAppDbContext context, IDateTimeService dateTime)
    {
        _context = context;
        _dateTime = dateTime;
    }

    public async Task<Guid> Handle(ReceiptStockCommand request, CancellationToken cancellationToken)
    {
        // Idempotency check
        if (!string.IsNullOrEmpty(request.ClientOperationId))
        {
            var existing = await _context.StockMoves
                .FirstOrDefaultAsync(m => m.ClientOperationId == request.ClientOperationId, cancellationToken);
            if (existing != null)
                return existing.Id;
        }

        var warehouse = await _context.Warehouses.FindAsync(new object[] { request.WarehouseId }, cancellationToken)
            ?? throw new NotFoundException(nameof(Warehouse), request.WarehouseId);

        if (!warehouse.IsActive)
            throw new ConflictException($"Warehouse '{warehouse.Name}' is not active.");

        _ = await _context.WarehouseItems.FindAsync(new object[] { request.ItemId }, cancellationToken)
            ?? throw new NotFoundException(nameof(WarehouseItem), request.ItemId);

        var move = new StockMove
        {
            WarehouseId = request.WarehouseId,
            ItemId = request.ItemId,
            BatchId = request.BatchId,
            MoveType = StockMoveType.Receipt,
            Quantity = request.Quantity,
            UnitCode = request.UnitCode,
            QuantityBase = request.Quantity,
            Note = request.Note,
            ClientOperationId = request.ClientOperationId
        };

        _context.StockMoves.Add(move);

        // Upsert StockBalance
        var balance = await _context.StockBalances
            .FirstOrDefaultAsync(b =>
                b.WarehouseId == request.WarehouseId &&
                b.ItemId == request.ItemId &&
                b.BatchId == request.BatchId,
                cancellationToken);

        if (balance == null)
        {
            balance = new StockBalance
            {
                WarehouseId = request.WarehouseId,
                ItemId = request.ItemId,
                BatchId = request.BatchId,
                BalanceBase = request.Quantity,
                BaseUnit = request.UnitCode,
                LastUpdatedUtc = _dateTime.UtcNow
            };
            _context.StockBalances.Add(balance);
        }
        else
        {
            balance.BalanceBase += request.Quantity;
            balance.LastUpdatedUtc = _dateTime.UtcNow;
        }

        await _context.SaveChangesAsync(cancellationToken);
        return move.Id;
    }
}
