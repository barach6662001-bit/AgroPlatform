using System.Text.Json;
using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Warehouses.Commands.InventoryAdjust;
using AgroPlatform.Application.Warehouses.Commands.IssueStock;
using AgroPlatform.Application.Warehouses.Commands.TransferStock;
using AgroPlatform.Domain.Approval;
using AgroPlatform.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Approval.Commands.DecideApproval;

public class DecideApprovalHandler : IRequestHandler<DecideApprovalCommand, ApprovalStatus>
{
    private readonly IAppDbContext _context;
    private readonly IDateTimeService _dateTime;
    private readonly ICurrentUserService _currentUser;
    private readonly ISender _sender;

    public DecideApprovalHandler(
        IAppDbContext context,
        IDateTimeService dateTime,
        ICurrentUserService currentUser,
        ISender sender)
    {
        _context = context;
        _dateTime = dateTime;
        _currentUser = currentUser;
        _sender = sender;
    }

    public async Task<ApprovalStatus> Handle(DecideApprovalCommand request, CancellationToken cancellationToken)
    {
        var approval = await _context.ApprovalRequests
            .FirstOrDefaultAsync(a => a.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(ApprovalRequest), request.Id);

        if (approval.Status != ApprovalStatus.Pending)
            throw new ConflictException($"Approval request {request.Id} has already been decided.");

        approval.DecidedBy = _currentUser.UserId;
        approval.DecidedAtUtc = _dateTime.UtcNow;

        if (!request.Approve)
        {
            approval.Status = ApprovalStatus.Rejected;
            approval.RejectionReason = request.RejectionReason;
            await _context.SaveChangesAsync(cancellationToken);
            return ApprovalStatus.Rejected;
        }

        // Mark as approved FIRST to prevent double execution
        approval.Status = ApprovalStatus.Approved;
        await _context.SaveChangesAsync(cancellationToken);

        // Replay the original operation
        await ReplayOperation(approval, cancellationToken);

        return ApprovalStatus.Approved;
    }

    private async Task ReplayOperation(ApprovalRequest approval, CancellationToken cancellationToken)
    {
        var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

        switch (approval.ActionType)
        {
            case ApprovalActionType.IssueStock:
                var issueCmd = JsonSerializer.Deserialize<IssueStockCommand>(approval.Payload, options)
                    ?? throw new InvalidOperationException("Failed to deserialize IssueStock payload.");
                await _sender.Send(issueCmd, cancellationToken);
                break;

            case ApprovalActionType.InventoryAdjust:
                var adjustCmd = JsonSerializer.Deserialize<InventoryAdjustCommand>(approval.Payload, options)
                    ?? throw new InvalidOperationException("Failed to deserialize InventoryAdjust payload.");
                await _sender.Send(adjustCmd, cancellationToken);
                break;

            case ApprovalActionType.TransferStock:
                var transferCmd = JsonSerializer.Deserialize<TransferStockCommand>(approval.Payload, options)
                    ?? throw new InvalidOperationException("Failed to deserialize TransferStock payload.");
                await _sender.Send(transferCmd, cancellationToken);
                break;

            default:
                throw new InvalidOperationException($"Unsupported action type: {approval.ActionType}");
        }
    }
}
