using AgroPlatform.Domain.Common;
using AgroPlatform.Domain.Enums;

namespace AgroPlatform.Domain.Approval;

public class ApprovalRule : AuditableEntity
{
    /// <summary>Entity type this rule applies to, e.g. "WarehouseItem".</summary>
    public string EntityType { get; set; } = string.Empty;

    /// <summary>Action type this rule gates.</summary>
    public ApprovalActionType ActionType { get; set; }

    /// <summary>Threshold amount above which approval is required.</summary>
    public decimal Threshold { get; set; }

    /// <summary>Role that can approve this request.</summary>
    public string RequiredRole { get; set; } = string.Empty;
}
