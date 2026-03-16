using AgroPlatform.Application.Fields.DTOs;
using MediatR;

namespace AgroPlatform.Application.Fields.Queries.GetLeasesSummary;

public record GetLeasesSummaryQuery(int Year) : IRequest<List<LeaseSummaryDto>>;
