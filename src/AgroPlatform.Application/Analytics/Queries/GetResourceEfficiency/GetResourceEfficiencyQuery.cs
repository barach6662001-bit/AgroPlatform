using AgroPlatform.Application.Analytics.DTOs;
using MediatR;

namespace AgroPlatform.Application.Analytics.Queries.GetResourceEfficiency;

public record GetResourceEfficiencyQuery(int? Year) : IRequest<ResourceEfficiencyDto>;
