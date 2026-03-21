using MediatR;

namespace AgroPlatform.Application.Fields.Commands.CreateSoilAnalysis;

public record CreateSoilAnalysisCommand(
    Guid FieldId,
    Guid? ZoneId,
    DateTime SampleDate,
    decimal? pH,
    decimal? Nitrogen,
    decimal? Phosphorus,
    decimal? Potassium,
    decimal? Humus,
    string? Notes
) : IRequest<Guid>;
