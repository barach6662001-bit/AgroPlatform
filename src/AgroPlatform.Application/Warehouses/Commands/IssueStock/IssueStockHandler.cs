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
    private readonly IStockBalanceService _stockBalance;

    public IssueStockHandler(IAppDbContext context, IDateTimeService dateTime, IStockBalanceService stockBalance)
    {
        _context = context;
        _dateTime = dateTime;
        _stockBalance = stockBalance;
    }

    public async Task<Guid> Handle(IssueStockCommand request, CancellationToken cancellationToken)
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
            MoveType = StockMoveType.Issue,
            Quantity = request.Quantity,
            UnitCode = request.UnitCode,
            QuantityBase = request.Quantity,
            Note = request.Note,
            ClientOperationId = request.ClientOperationId
        };

        _context.StockMoves.Add(move);

        await _stockBalance.DecreaseBalance(request.WarehouseId, request.ItemId, request.BatchId, request.Quantity, cancellationToken);

        await _context.SaveChangesAsync(cancellationToken);
        return move.Id;
    }
}
