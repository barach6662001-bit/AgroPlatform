using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Fuel;
using MediatR;

namespace AgroPlatform.Application.Fuel.Commands.CreateFuelTank;

public class CreateFuelTankHandler : IRequestHandler<CreateFuelTankCommand, Guid>
{
    private readonly IAppDbContext _context;

    public CreateFuelTankHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateFuelTankCommand request, CancellationToken cancellationToken)
    {
        var tank = new FuelTank
        {
            Name = request.Name,
            FuelType = request.FuelType,
            CapacityLiters = request.CapacityLiters,
            CurrentLiters = 0,
            IsActive = true,
        };

        _context.FuelTanks.Add(tank);
        await _context.SaveChangesAsync(cancellationToken);
        return tank.Id;
    }
}
