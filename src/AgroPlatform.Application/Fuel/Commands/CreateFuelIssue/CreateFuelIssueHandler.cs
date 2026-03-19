using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
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

        var transaction = new FuelTransaction
        {
            FuelTankId = request.FuelTankId,
            TransactionType = "Issue",
            QuantityLiters = request.QuantityLiters,
            TransactionDate = request.TransactionDate,
            MachineId = request.MachineId,
            DriverName = request.DriverName,
            Notes = request.Notes,
        };

        _context.FuelTransactions.Add(transaction);
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
