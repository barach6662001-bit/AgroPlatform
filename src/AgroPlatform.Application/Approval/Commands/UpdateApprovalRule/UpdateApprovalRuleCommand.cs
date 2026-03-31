using AgroPlatform.Domain.Enums;
using MediatR;

namespace AgroPlatform.Application.Approval.Commands.UpdateApprovalRule;

public record UpdateApprovalRuleCommand(
    Guid Id,
    string EntityType,
    ApprovalActionType ActionType,
    decimal Threshold,
    string RequiredRole) : IRequest;
