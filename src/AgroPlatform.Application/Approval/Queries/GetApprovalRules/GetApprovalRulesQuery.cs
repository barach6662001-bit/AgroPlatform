using AgroPlatform.Application.Approval.DTOs;
using MediatR;

namespace AgroPlatform.Application.Approval.Queries.GetApprovalRules;

public record GetApprovalRulesQuery : IRequest<List<ApprovalRuleDto>>;
