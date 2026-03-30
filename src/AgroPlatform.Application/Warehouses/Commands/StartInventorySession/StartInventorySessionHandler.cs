using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Warehouses;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Warehouses.Commands.StartInventorySession;

public class StartInventorySessionHandler : IRequestHandler<StartInventorySessionCommand, Guid>
{
    private readonly IAppDbContext _context;

    public StartInventorySessionHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(StartInventorySessionCommand request, CancellationToken cancellationToken)
    {
        var warehouse = await _context.Warehouses.FindAsync(new object[] { request.WarehouseId }, cancellationToken)
            ?? throw new NotFoundException(nameof(Warehouse), request.WarehouseId);

        warehouse.EnsureActive();

        var session = new InventorySession
        {
            WarehouseId = request.WarehouseId,
            Notes = request.Notes,
        };

        // Prefill lines from current stock balances
        var balances = await _context.StockBalances
            .Where(b => b.WarehouseId == request.WarehouseId)
            .ToListAsync(cancellationToken);

        foreach (var balance in balances)
        {
            session.Lines.Add(new InventorySessionLine
            {
                ItemId = balance.ItemId,
                BatchId = balance.BatchId,
                ExpectedQuantityBase = balance.BalanceBase,
                BaseUnit = balance.BaseUnit,
                IsCountRecorded = false
            });
        }

        _context.InventorySessions.Add(session);
        await _context.SaveChangesAsync(cancellationToken);

        return session.Id;
    }
}
