using AgroPlatform.Domain.Enums;

namespace AgroPlatform.Application.Common.Interfaces;

/// <summary>
/// Checks approval rules and creates approval requests when thresholds are exceeded.
/// </summary>
public interface IApprovalService
{
    /// <summary>
    /// Checks if an operation requires approval. If it does, creates an ApprovalRequest and returns true.
    /// </summary>
    Task<(bool RequiresApproval, Guid? ApprovalRequestId)> CheckAndCreateIfRequired(
        ApprovalActionType actionType,
        string entityType,
        Guid? entityId,
        decimal amount,
        string payload,
        string? requestedBy,
        CancellationToken cancellationToken);
}
