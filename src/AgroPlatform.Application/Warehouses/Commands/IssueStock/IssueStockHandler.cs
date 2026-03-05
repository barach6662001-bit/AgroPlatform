using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Enums;
using AgroPlatform.Domain.Warehouses;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Warehouses.Commands.IssueStock;

public class IssueStockHandler : IRequestHandler<IssueStockCommand, Guid>
{
    private readonly IAppDbContext _context;
    private readonly IDateTimeService _dateTime;

    public IssueStockHandler(IAppDbContext context, IDateTimeService dateTime)
    {
        _context = context;
        _dateTime = dateTime;
    }

    public async Task<Guid> Handle(IssueStockCommand request, CancellationToken cancellationToken)
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

        if (balance == null || balance.BalanceBase < request.Quantity)
            throw new ConflictException("Insufficient stock balance.");

        var move = new StockMove
        {
            WarehouseId = request.WarehouseId,
            ItemId = request.ItemId,
            BatchId = request.BatchId,
            MoveType = StockMoveType.Issue,
            Quantity = request.Quantity,
            UnitCode = request.UnitCode,
            QuantityBase = request.Quantity,
            Note = request.Note
        };

        _context.StockMoves.Add(move);

        balance.BalanceBase -= request.Quantity;
        balance.LastUpdatedUtc = _dateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
        return move.Id;
    }
}
