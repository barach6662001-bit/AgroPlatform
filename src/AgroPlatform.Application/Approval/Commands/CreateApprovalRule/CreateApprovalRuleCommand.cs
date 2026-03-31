using AgroPlatform.Domain.Enums;
using MediatR;

namespace AgroPlatform.Application.Approval.Commands.CreateApprovalRule;

public record CreateApprovalRuleCommand(
    string EntityType,
    ApprovalActionType ActionType,
    decimal Threshold,
    string RequiredRole) : IRequest<Guid>;
