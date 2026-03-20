using MediatR;

namespace AgroPlatform.Application.Fields.Commands.CreateVraMap;

public record CreateVraZoneCommand(
    int ZoneIndex,
    string ZoneName,
    decimal? NdviValue,
    decimal? SoilOrganicMatter,
    decimal? SoilNitrogen,
    decimal? SoilPhosphorus,
    decimal? SoilPotassium,
    decimal AreaHectares,
    decimal RateKgPerHa,
    string Color
);

public record CreateVraMapCommand(
    Guid FieldId,
    string Name,
    string FertilizerName,
    int Year,
    string? Notes,
    IReadOnlyList<CreateVraZoneCommand> Zones
) : IRequest<Guid>;
