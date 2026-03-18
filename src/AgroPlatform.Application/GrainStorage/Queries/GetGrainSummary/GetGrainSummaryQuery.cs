using AgroPlatform.Application.GrainStorage.DTOs;
using MediatR;

namespace AgroPlatform.Application.GrainStorage.Queries.GetGrainSummary;

public record GetGrainSummaryQuery : IRequest<IReadOnlyList<GrainSummaryDto>>;
