using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Economics;
using AgroPlatform.Domain.Enums;
using AgroPlatform.Domain.Fuel;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Fuel.Commands.CreateFuelIssue;

public class CreateFuelIssueHandler : IRequestHandler<CreateFuelIssueCommand, Guid>
{
    private readonly IAppDbContext _context;
    private readonly INotificationService _notifications;
    private readonly ICurrentUserService _currentUser;

    public CreateFuelIssueHandler(
        IAppDbContext context,
        INotificationService notifications,
        ICurrentUserService currentUser)
    {
        _context = context;
        _notifications = notifications;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(CreateFuelIssueCommand request, CancellationToken cancellationToken)
    {
        var tank = await _context.FuelTanks
            .FirstOrDefaultAsync(t => t.Id == request.FuelTankId, cancellationToken)
            ?? throw new NotFoundException(nameof(FuelTank), request.FuelTankId);

        if (tank.CurrentLiters < request.QuantityLiters)
            throw new ConflictException("Insufficient fuel in tank");

        tank.CurrentLiters -= request.QuantityLiters;

        // Get price from last supply to this tank
        decimal? pricePerLiter = await _context.FuelTransactions
            .Where(t => t.FuelTankId == request.FuelTankId
                && t.TransactionType == "Supply"
                && t.PricePerLiter.HasValue)
            .OrderByDescending(t => t.TransactionDate)
            .Select(t => t.PricePerLiter)
            .FirstOrDefaultAsync(cancellationToken);

        // Fallback to tank's own price
        pricePerLiter ??= tank.PricePerLiter;

        var totalCost = pricePerLiter.HasValue
            ? Math.Round(request.QuantityLiters * pricePerLiter.Value, 2)
            : (decimal?)null;

        var transaction = new FuelTransaction
        {
            FuelTankId = request.FuelTankId,
            TransactionType = "Issue",
            QuantityLiters = request.QuantityLiters,
            PricePerLiter = pricePerLiter,
            TotalCost = totalCost,
            TransactionDate = request.TransactionDate,
            MachineId = request.MachineId,
            FieldId = request.FieldId,
            DriverName = request.DriverName,
            Notes = request.Notes,
        };

        _context.FuelTransactions.Add(transaction);

        // Auto-create cost record for fuel issue
        if (totalCost.HasValue && totalCost > 0)
        {
            _context.CostRecords.Add(new CostRecord
            {
                Category = CostCategory.Fuel,
                Amount = totalCost.Value,
                Currency = "UAH",
                Date = request.TransactionDate,
                FieldId = request.FieldId,
                Description = $"Паливо: {request.QuantityLiters:F0}л × {pricePerLiter:F2} UAH/л"
            });
        }

        await _context.SaveChangesAsync(cancellationToken);

        // Notify if fuel tank is running low (below 20%)
        if (tank.CapacityLiters > 0 && tank.CurrentLiters < tank.CapacityLiters * 0.2m)
        {
            var pct = Math.Round(tank.CurrentLiters / tank.CapacityLiters * 100, 0);
            await _notifications.SendAsync(
                _currentUser.TenantId,
                "warning",
                "Низький рівень палива",
                $"Резервуар '{tank.Name}': залишок {tank.CurrentLiters:F0}л з {tank.CapacityLiters:F0}л ({pct}%)",
                cancellationToken);
        }

        return transaction.Id;
    }
}
