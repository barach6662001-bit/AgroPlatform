using MediatR;

namespace AgroPlatform.Application.Approval.Commands.DeleteApprovalRule;

public record DeleteApprovalRuleCommand(Guid Id) : IRequest;
