using MediatR;

namespace AgroPlatform.Application.Fields.Commands.CreateFieldSeeding;

public record CreateFieldSeedingCommand(
    Guid FieldId,
    int Year,
    string CropName,
    string? Variety,
    decimal? SeedingRateKgPerHa,
    decimal? TotalSeedKg,
    DateTime? SeedingDate,
    string? Notes
) : IRequest<Guid>;
