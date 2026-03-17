using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Fuel;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Fuel.Commands.CreateFuelSupply;

public class CreateFuelSupplyHandler : IRequestHandler<CreateFuelSupplyCommand, Guid>
{
    private readonly IAppDbContext _context;

    public CreateFuelSupplyHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateFuelSupplyCommand request, CancellationToken cancellationToken)
    {
        var tank = await _context.FuelTanks
            .FirstOrDefaultAsync(t => t.Id == request.FuelTankId, cancellationToken)
            ?? throw new NotFoundException(nameof(FuelTank), request.FuelTankId);

        tank.CurrentLiters += request.QuantityLiters;
        if (request.PricePerLiter.HasValue)
            tank.PricePerLiter = request.PricePerLiter;

        var transaction = new FuelTransaction
        {
            FuelTankId = request.FuelTankId,
            TransactionType = "Supply",
            QuantityLiters = request.QuantityLiters,
            PricePerLiter = request.PricePerLiter,
            TotalCost = request.PricePerLiter.HasValue
                ? request.PricePerLiter.Value * request.QuantityLiters
                : tank.PricePerLiter.HasValue
                    ? tank.PricePerLiter.Value * request.QuantityLiters
                    : null,
            TransactionDate = request.TransactionDate,
            SupplierName = request.SupplierName,
            InvoiceNumber = request.InvoiceNumber,
            Notes = request.Notes,
        };

        _context.FuelTransactions.Add(transaction);
        await _context.SaveChangesAsync(cancellationToken);
        return transaction.Id;
    }
}
