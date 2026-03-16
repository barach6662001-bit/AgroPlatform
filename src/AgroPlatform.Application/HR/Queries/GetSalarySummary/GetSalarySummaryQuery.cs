using AgroPlatform.Application.HR.DTOs;
using MediatR;

namespace AgroPlatform.Application.HR.Queries.GetSalarySummary;

public record GetSalarySummaryQuery(int Month, int Year) : IRequest<SalarySummaryDto>;
