using MediatR;

namespace AgroPlatform.Application.Fields.Commands.CreateFieldProtection;

public record CreateFieldProtectionCommand(
    Guid FieldId,
    int Year,
    string ProductName,
    string? ProtectionType,
    decimal? RateLPerHa,
    decimal? TotalLiters,
    decimal? CostPerLiter,
    decimal? TotalCost,
    DateTime ApplicationDate,
    string? Notes
) : IRequest<Guid>;
