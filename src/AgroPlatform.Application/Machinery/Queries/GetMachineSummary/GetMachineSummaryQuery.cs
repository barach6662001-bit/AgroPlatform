using AgroPlatform.Application.Machinery.DTOs;
using MediatR;

namespace AgroPlatform.Application.Machinery.Queries.GetMachineSummary;

public record GetMachineSummaryQuery() : IRequest<MachineSummaryDto>;
