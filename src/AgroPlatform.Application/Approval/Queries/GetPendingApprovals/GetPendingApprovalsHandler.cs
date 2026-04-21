using AgroPlatform.Application.Approval.DTOs;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Approval.Queries.GetPendingApprovals;

public class GetPendingApprovalsHandler : IRequestHandler<GetPendingApprovalsQuery, List<ApprovalRequestDto>>
{
    private readonly IAppDbContext _context;

    public GetPendingApprovalsHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<List<ApprovalRequestDto>> Handle(GetPendingApprovalsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.ApprovalRequests.AsQueryable();

        if (request.Status.HasValue)
            query = query.Where(a => a.Status == request.Status.Value);
        else
            query = query.Where(a => a.Status == ApprovalStatus.Pending);

        return await query
            .OrderByDescending(a => a.CreatedAtUtc)
            .Select(a => new ApprovalRequestDto(
                a.Id,
                a.EntityType,
                a.EntityId,
                a.ActionType,
                a.Payload,
                a.Status,
                a.RequestedBy,
                a.DecidedBy,
                a.DecidedAtUtc,
                a.RejectionReason,
                a.Amount,
                a.CreatedAtUtc))
            .ToListAsync(cancellationToken);
    }
}
