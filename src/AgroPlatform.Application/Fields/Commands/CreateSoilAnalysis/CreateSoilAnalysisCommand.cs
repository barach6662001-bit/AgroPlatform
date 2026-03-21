using MediatR;

namespace AgroPlatform.Application.Fields.Commands.CreateSoilAnalysis;

public record CreateSoilAnalysisCommand(
    Guid FieldId,
    string? ZoneId,
    DateTime SampleDate,
    decimal? Ph,
    decimal? N,
    decimal? P,
    decimal? K,
    decimal? Humus,
    string? Notes
) : IRequest<Guid>;
