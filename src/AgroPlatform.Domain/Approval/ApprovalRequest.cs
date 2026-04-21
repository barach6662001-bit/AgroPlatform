using AgroPlatform.Domain.Common;
using AgroPlatform.Domain.Enums;

namespace AgroPlatform.Domain.Approval;

public class ApprovalRequest : AuditableEntity
{
    /// <summary>Entity type, e.g. "WarehouseItem".</summary>
    public string EntityType { get; set; } = string.Empty;

    /// <summary>Optional entity identifier for context.</summary>
    public Guid? EntityId { get; set; }

    /// <summary>Action that requires approval.</summary>
    public ApprovalActionType ActionType { get; set; }

    /// <summary>Serialized command payload (JSON).</summary>
    public string Payload { get; set; } = string.Empty;

    /// <summary>Current status.</summary>
    public ApprovalStatus Status { get; set; } = ApprovalStatus.Pending;

    /// <summary>User who requested the operation.</summary>
    public string? RequestedBy { get; set; }

    /// <summary>User who approved or rejected.</summary>
    public string? DecidedBy { get; set; }

    /// <summary>Date/time of decision.</summary>
    public DateTime? DecidedAtUtc { get; set; }

    /// <summary>Optional rejection reason.</summary>
    public string? RejectionReason { get; set; }

    /// <summary>Amount that triggered the approval (for reference).</summary>
    public decimal Amount { get; set; }
}
