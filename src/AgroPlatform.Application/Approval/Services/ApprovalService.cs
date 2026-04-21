using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Approval;
using AgroPlatform.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Approval.Services;

public class ApprovalService : IApprovalService
{
    private readonly IAppDbContext _context;
    private readonly IDateTimeService _dateTime;

    public ApprovalService(IAppDbContext context, IDateTimeService dateTime)
    {
        _context = context;
        _dateTime = dateTime;
    }

    public async Task<(bool RequiresApproval, Guid? ApprovalRequestId)> CheckAndCreateIfRequired(
        ApprovalActionType actionType,
        string entityType,
        Guid? entityId,
        decimal amount,
        string payload,
        string? requestedBy,
        CancellationToken cancellationToken)
    {
        var rule = await _context.ApprovalRules
            .Where(r => r.ActionType == actionType && r.EntityType == entityType && amount > r.Threshold)
            .OrderByDescending(r => r.Threshold)
            .FirstOrDefaultAsync(cancellationToken);

        if (rule is null)
            return (false, null);

        var request = new ApprovalRequest
        {
            EntityType = entityType,
            EntityId = entityId,
            ActionType = actionType,
            Payload = payload,
            Status = ApprovalStatus.Pending,
            RequestedBy = requestedBy,
            Amount = amount
        };

        _context.ApprovalRequests.Add(request);
        await _context.SaveChangesAsync(cancellationToken);

        return (true, request.Id);
    }
}
