using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Fuel.DTOs;
using AgroPlatform.Domain.Enums;
using AgroPlatform.Domain.Fuel;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Fuel.Commands.UpsertFuelNorm;

public class UpsertFuelNormHandler : IRequestHandler<UpsertFuelNormCommand, FuelNormDto>
{
    private readonly IAppDbContext _context;

    public UpsertFuelNormHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<FuelNormDto> Handle(UpsertFuelNormCommand request, CancellationToken cancellationToken)
    {
        if (!Enum.TryParse<MachineryType>(request.MachineType, ignoreCase: true, out var machineType))
            throw new ArgumentException($"Invalid MachineType: {request.MachineType}");

        if (!Enum.TryParse<AgroOperationType>(request.OperationType, ignoreCase: true, out var operationType))
            throw new ArgumentException($"Invalid OperationType: {request.OperationType}");

        var norm = await _context.FuelNorms
            .FirstOrDefaultAsync(n => n.MachineType == machineType && n.OperationType == operationType,
                cancellationToken);

        if (norm is null)
        {
            norm = new FuelNorm
            {
                MachineType = machineType,
                OperationType = operationType,
            };
            _context.FuelNorms.Add(norm);
        }

        norm.NormLitersPerHa = request.NormLitersPerHa;
        norm.NormLitersPerHour = request.NormLitersPerHour;
        norm.Notes = request.Notes;

        await _context.SaveChangesAsync(cancellationToken);

        return new FuelNormDto
        {
            Id = norm.Id,
            MachineType = norm.MachineType.ToString(),
            OperationType = norm.OperationType.ToString(),
            NormLitersPerHa = norm.NormLitersPerHa,
            NormLitersPerHour = norm.NormLitersPerHour,
            Notes = norm.Notes,
        };
    }
}
