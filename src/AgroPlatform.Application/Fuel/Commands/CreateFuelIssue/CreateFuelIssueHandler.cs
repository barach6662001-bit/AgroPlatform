using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Fuel;
using FluentValidation.Results;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Fuel.Commands.CreateFuelIssue;

public class CreateFuelIssueHandler : IRequestHandler<CreateFuelIssueCommand, Guid>
{
    private readonly IAppDbContext _context;

    public CreateFuelIssueHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateFuelIssueCommand request, CancellationToken cancellationToken)
    {
        var tank = await _context.FuelTanks
            .FirstOrDefaultAsync(t => t.Id == request.FuelTankId, cancellationToken)
            ?? throw new NotFoundException("FuelTank", request.FuelTankId);

        if (tank.CurrentLiters < request.QuantityLiters)
            throw new ValidationException(new[]
            {
                new ValidationFailure("QuantityLiters", "Недостатньо пального в резервуарі"),
            });

        tank.CurrentLiters -= request.QuantityLiters;

        var totalCost = request.PricePerLiter.HasValue
            ? request.PricePerLiter.Value * request.QuantityLiters
            : tank.PricePerLiter.HasValue
                ? tank.PricePerLiter.Value * request.QuantityLiters
                : (decimal?)null;

        var transaction = new FuelTransaction
        {
            FuelTankId = request.FuelTankId,
            TransactionType = "Issue",
            QuantityLiters = request.QuantityLiters,
            PricePerLiter = request.PricePerLiter ?? tank.PricePerLiter,
            TotalCost = totalCost,
            TransactionDate = request.TransactionDate,
            MachineId = request.MachineId,
            DriverName = request.DriverName,
            Notes = request.Notes,
        };

        _context.FuelTransactions.Add(transaction);
        await _context.SaveChangesAsync(cancellationToken);
        return transaction.Id;
    }
}
