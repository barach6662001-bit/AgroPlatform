using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.AgroOperations;
using AgroPlatform.Domain.Enums;
using AgroPlatform.Domain.Warehouses;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.AgroOperations.Commands.CompleteAgroOperation;

public class CompleteAgroOperationHandler : IRequestHandler<CompleteAgroOperationCommand>
{
    private readonly IAppDbContext _context;

    public CompleteAgroOperationHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task Handle(CompleteAgroOperationCommand request, CancellationToken cancellationToken)
    {
        var operation = await _context.AgroOperations
            .Include(o => o.Resources)
            .FirstOrDefaultAsync(o => o.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(AgroOperation), request.Id);

        operation.IsCompleted = true;
        operation.CompletedDate = request.CompletedDate;

        if (request.AreaProcessed.HasValue)
            operation.AreaProcessed = request.AreaProcessed.Value;

        foreach (var resource in operation.Resources)
        {
            if (resource.ActualQuantity.HasValue && resource.StockMoveId == null)
            {
                var balance = await _context.StockBalances
                    .FirstOrDefaultAsync(b =>
                        b.WarehouseId == resource.WarehouseId &&
                        b.ItemId == resource.WarehouseItemId &&
                        b.BatchId == null,
                        cancellationToken);

                if (balance == null || balance.BalanceBase < resource.ActualQuantity.Value)
                    throw new ConflictException($"Insufficient stock balance for warehouse item {resource.WarehouseItemId}.");

                var move = new StockMove
                {
                    WarehouseId = resource.WarehouseId,
                    ItemId = resource.WarehouseItemId,
                    MoveType = StockMoveType.Issue,
                    Quantity = resource.ActualQuantity.Value,
                    UnitCode = resource.UnitCode,
                    QuantityBase = resource.ActualQuantity.Value,
                    OperationId = operation.Id
                };

                _context.StockMoves.Add(move);

                balance.BalanceBase -= resource.ActualQuantity.Value;

                resource.StockMoveId = move.Id;
            }
        }

        await _context.SaveChangesAsync(cancellationToken);
    }
}
