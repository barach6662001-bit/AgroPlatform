using AgroPlatform.Application.Fields.DTOs;
using MediatR;

namespace AgroPlatform.Application.Fields.Queries.GetSoilAnalyses;

public record GetSoilAnalysesQuery(Guid FieldId) : IRequest<List<SoilAnalysisDto>>;
