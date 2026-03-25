using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Extensions;
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
    private readonly IStockBalanceService _stockBalance;

    public InventoryAdjustHandler(IAppDbContext context, IDateTimeService dateTime, IStockBalanceService stockBalance)
    {
        _context = context;
        _dateTime = dateTime;
        _stockBalance = stockBalance;
    }

    public async Task<InventoryAdjustResultDto> Handle(InventoryAdjustCommand request, CancellationToken cancellationToken)
    {
        await using var tx = await _context.Database.BeginRepeatableReadTransactionIfSupportedAsync(cancellationToken);

        var warehouse = await _context.Warehouses.FindAsync(new object[] { request.WarehouseId }, cancellationToken)
            ?? throw new NotFoundException(nameof(Warehouse), request.WarehouseId);

        if (!warehouse.IsActive)
            throw new ConflictException($"Warehouse '{warehouse.Name}' is not active.");

        _ = await _context.WarehouseItems.FindAsync(new object[] { request.ItemId }, cancellationToken)
            ?? throw new NotFoundException(nameof(WarehouseItem), request.ItemId);

        var currentBalance = await _context.StockBalances
            .FirstOrDefaultAsync(b =>
                b.WarehouseId == request.WarehouseId &&
                b.ItemId == request.ItemId &&
                b.BatchId == request.BatchId,
                cancellationToken);

        var currentQty = currentBalance?.BalanceBase ?? 0m;
        var difference = request.ActualQuantity - currentQty;

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

        await _stockBalance.SetBalance(request.WarehouseId, request.ItemId, request.BatchId, request.ActualQuantity, request.UnitCode, cancellationToken);

        await _context.SaveChangesAsync(cancellationToken);
        if (tx is not null)
        {
            await tx.CommitAsync(cancellationToken);
        }

        return new InventoryAdjustResultDto
        {
            MoveId = moveId,
            AdjustmentAmount = difference
        };
    }
}
