using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Enums;
using AgroPlatform.Domain.Warehouses;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Warehouses.Commands.InventoryAdjust;

public class InventoryAdjustHandler : IRequestHandler<InventoryAdjustCommand, InventoryAdjustResultDto>
{
    private readonly IAppDbContext _context;
    private readonly IDateTimeService _dateTime;

    public InventoryAdjustHandler(IAppDbContext context, IDateTimeService dateTime)
    {
        _context = context;
        _dateTime = dateTime;
    }

    public async Task<InventoryAdjustResultDto> Handle(InventoryAdjustCommand request, CancellationToken cancellationToken)
    {
        var warehouse = await _context.Warehouses.FindAsync(new object[] { request.WarehouseId }, cancellationToken)
            ?? throw new NotFoundException(nameof(Warehouse), request.WarehouseId);

        if (!warehouse.IsActive)
            throw new ConflictException($"Warehouse '{warehouse.Name}' is not active.");

        _ = await _context.WarehouseItems.FindAsync(new object[] { request.ItemId }, cancellationToken)
            ?? throw new NotFoundException(nameof(WarehouseItem), request.ItemId);

        var balance = await _context.StockBalances
            .FirstOrDefaultAsync(b =>
                b.WarehouseId == request.WarehouseId &&
                b.ItemId == request.ItemId &&
                b.BatchId == request.BatchId,
                cancellationToken);

        var currentBalance = balance?.BalanceBase ?? 0m;
        var difference = request.ActualQuantity - currentBalance;
        var now = _dateTime.UtcNow;

        Guid? moveId = null;

        if (difference != 0)
        {
            var moveType = difference > 0 ? StockMoveType.InventoryPlus : StockMoveType.InventoryMinus;
            var adjustQty = Math.Abs(difference);

            var move = new StockMove
            {
                WarehouseId = request.WarehouseId,
                ItemId = request.ItemId,
                BatchId = request.BatchId,
                MoveType = moveType,
                Quantity = adjustQty,
                UnitCode = request.UnitCode,
                QuantityBase = adjustQty,
                Note = request.Note,
                ClientOperationId = request.ClientOperationId
            };

            _context.StockMoves.Add(move);
            moveId = move.Id;
        }

        if (balance == null)
        {
            balance = new StockBalance
            {
                WarehouseId = request.WarehouseId,
                ItemId = request.ItemId,
                BatchId = request.BatchId,
                BalanceBase = request.ActualQuantity,
                BaseUnit = request.UnitCode,
                LastUpdatedUtc = now
            };
            _context.StockBalances.Add(balance);
        }
        else
        {
            balance.BalanceBase = request.ActualQuantity;
            balance.LastUpdatedUtc = now;
        }

        await _context.SaveChangesAsync(cancellationToken);

        return new InventoryAdjustResultDto
        {
            MoveId = moveId,
            AdjustmentAmount = difference
        };
    }
}
