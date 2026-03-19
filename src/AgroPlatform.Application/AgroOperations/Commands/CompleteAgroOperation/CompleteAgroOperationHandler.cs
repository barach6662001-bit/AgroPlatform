using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.AgroOperations;
using AgroPlatform.Domain.Economics;
using AgroPlatform.Domain.Enums;
using AgroPlatform.Domain.Warehouses;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.AgroOperations.Commands.CompleteAgroOperation;

public class CompleteAgroOperationHandler : IRequestHandler<CompleteAgroOperationCommand>
{
    private readonly IAppDbContext _context;
    private readonly INotificationService _notifications;
    private readonly ICurrentUserService _currentUser;

    public CompleteAgroOperationHandler(
        IAppDbContext context,
        INotificationService notifications,
        ICurrentUserService currentUser)
    {
        _context = context;
        _notifications = notifications;
        _currentUser = currentUser;
    }

    public async Task Handle(CompleteAgroOperationCommand request, CancellationToken cancellationToken)
    {
        var operation = await _context.AgroOperations
            .Include(o => o.Resources)
            .Include(o => o.MachineryUsed)
                .ThenInclude(mu => mu.Machine)
            .FirstOrDefaultAsync(o => o.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(AgroOperation), request.Id);

        if (operation.IsCompleted)
            throw new ConflictException("Operation already completed.");

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

                // Check low-stock threshold
                var item = await _context.WarehouseItems.FindAsync([resource.WarehouseItemId], cancellationToken);
                if (item?.MinimumQuantity.HasValue == true && balance.BalanceBase < item.MinimumQuantity.Value)
                {
                    await _notifications.SendAsync(
                        _currentUser.TenantId,
                        "warning",
                        "Низький залишок",
                        $"Товар '{item.Name}' нижче мінімуму: {balance.BalanceBase:F2} {item.BaseUnit} (мін: {item.MinimumQuantity:F2})",
                        cancellationToken);
                }
            }
        }

        // === AUTO-CREATE COST RECORDS ===
        // For each resource with actual quantity used, create a cost record tied to the field
        foreach (var resource in operation.Resources.Where(r => r.ActualQuantity.HasValue && r.ActualQuantity > 0))
        {
            var warehouseItem = await _context.WarehouseItems
                .FirstOrDefaultAsync(wi => wi.Id == resource.WarehouseItemId, cancellationToken);

            if (warehouseItem != null && warehouseItem.PurchasePrice.HasValue && warehouseItem.PurchasePrice.Value > 0)
            {
                var totalCost = resource.ActualQuantity!.Value * warehouseItem.PurchasePrice.Value;

                // Map warehouse item category to cost category
                var costCategory = warehouseItem.Category switch
                {
                    "Fertilizers" => "Fertilizers",
                    "Seeds" => "Seeds",
                    "Pesticides" => "Pesticides",
                    "Fuel" => "Fuel",
                    _ => "Other"
                };

                _context.CostRecords.Add(new CostRecord
                {
                    Category = costCategory,
                    Amount = totalCost,
                    Currency = "UAH",
                    Date = request.CompletedDate,
                    FieldId = operation.FieldId,
                    AgroOperationId = operation.Id,
                    Description = $"{warehouseItem.Name}: {resource.ActualQuantity.Value:F2} {resource.UnitCode} × {warehouseItem.PurchasePrice.Value:F2} UAH"
                });
            }
        }

        await _context.SaveChangesAsync(cancellationToken);

        // Check if any machinery used in operation needs upcoming maintenance
        if (operation.MachineryUsed?.Any() == true)
        {
            var threshold = DateTime.UtcNow.AddDays(7);
            var machinesNeedingMaintenance = operation.MachineryUsed
                .Select(mu => mu.Machine)
                .Where(m => m.NextMaintenanceDate.HasValue && m.NextMaintenanceDate <= threshold)
                .ToList();

            foreach (var machine in machinesNeedingMaintenance)
            {
                await _notifications.SendAsync(
                    _currentUser.TenantId,
                    "warning",
                    "ТО наближається",
                    $"Техніка '{machine.Name}': планове ТО {machine.NextMaintenanceDate:dd.MM.yyyy}",
                    cancellationToken);
            }
        }

        // Notify operation completed
        await _notifications.SendAsync(
            _currentUser.TenantId,
            "info",
            "Операцію завершено",
            $"Агрооперацію успішно завершено {request.CompletedDate:dd.MM.yyyy}",
            cancellationToken);
    }
}
