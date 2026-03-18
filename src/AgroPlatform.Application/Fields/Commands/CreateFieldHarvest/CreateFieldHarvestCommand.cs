using MediatR;

namespace AgroPlatform.Application.Fields.Commands.CreateFieldHarvest;

public record CreateFieldHarvestCommand(
    Guid FieldId,
    int Year,
    string CropName,
    decimal TotalTons,
    decimal? MoisturePercent,
    decimal? PricePerTon,
    DateTime HarvestDate,
    string? Notes
) : IRequest<Guid>;
