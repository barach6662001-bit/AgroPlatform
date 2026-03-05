using AgroPlatform.Application.Analytics.DTOs;
using MediatR;

namespace AgroPlatform.Application.Analytics.Queries.GetFieldEfficiency;

public record GetFieldEfficiencyQuery() : IRequest<List<FieldEfficiencyDto>>;
