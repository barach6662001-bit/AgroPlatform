using MediatR;

namespace AgroPlatform.Application.Fields.Commands.UpdateSoilAnalysis;

public record UpdateSoilAnalysisCommand(
    Guid Id,
    Guid? ZoneId,
    DateTime SampleDate,
    decimal? pH,
    decimal? Nitrogen,
    decimal? Phosphorus,
    decimal? Potassium,
    decimal? Humus,
    string? Notes
) : IRequest;
