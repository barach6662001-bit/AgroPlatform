using MediatR;

namespace AgroPlatform.Application.Fields.Commands.CreateFieldFertilizer;

public record CreateFieldFertilizerCommand(
    Guid FieldId,
    int Year,
    string FertilizerName,
    string? ApplicationType,
    decimal? RateKgPerHa,
    decimal? TotalKg,
    decimal? CostPerKg,
    decimal? TotalCost,
    DateTime ApplicationDate,
    string? Notes
) : IRequest<Guid>;
