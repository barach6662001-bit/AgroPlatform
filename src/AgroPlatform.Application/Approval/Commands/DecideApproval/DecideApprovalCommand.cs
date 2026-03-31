using AgroPlatform.Domain.Enums;
using MediatR;

namespace AgroPlatform.Application.Approval.Commands.DecideApproval;

public record DecideApprovalCommand(
    Guid Id,
    bool Approve,
    string? RejectionReason = null) : IRequest<ApprovalStatus>;
