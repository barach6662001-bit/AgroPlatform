using AgroPlatform.Application.Approval.DTOs;
using AgroPlatform.Domain.Enums;
using MediatR;

namespace AgroPlatform.Application.Approval.Queries.GetPendingApprovals;

public record GetPendingApprovalsQuery(ApprovalStatus? Status = null) : IRequest<List<ApprovalRequestDto>>;
