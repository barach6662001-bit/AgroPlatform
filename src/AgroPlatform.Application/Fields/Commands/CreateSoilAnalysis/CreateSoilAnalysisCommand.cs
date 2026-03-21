using MediatR;

namespace AgroPlatform.Application.Fields.Commands.CreateSoilAnalysis;

public record CreateSoilAnalysisCommand(
    Guid FieldId,
    int Year,
    DateTime? SampleDate,
    decimal? Ph,
    decimal? OrganicMatter,
    decimal? Nitrogen,
    decimal? Phosphorus,
    decimal? Potassium,
    int? SampleDepthCm,
    string? LabName,
    string? Notes
) : IRequest<Guid>;
