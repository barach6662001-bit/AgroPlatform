using AgroPlatform.Application.Fuel.DTOs;
using MediatR;

namespace AgroPlatform.Application.Fuel.Commands.UpsertFuelNorm;

/// <summary>Creates or updates the fuel norm for a machine-type × operation-type pair.</summary>
public record UpsertFuelNormCommand(
    string MachineType,
    string OperationType,
    decimal? NormLitersPerHa,
    decimal? NormLitersPerHour,
    string? Notes
) : IRequest<FuelNormDto>;
