using AgroPlatform.Domain.Enums;

namespace AgroPlatform.Application.Approval.DTOs;

public record ApprovalRuleDto(
    Guid Id,
    string EntityType,
    ApprovalActionType ActionType,
    decimal Threshold,
    string RequiredRole);

public record ApprovalRequestDto(
    Guid Id,
    string EntityType,
    Guid? EntityId,
    ApprovalActionType ActionType,
    string Payload,
    ApprovalStatus Status,
    string? RequestedBy,
    string? DecidedBy,
    DateTime? DecidedAtUtc,
    string? RejectionReason,
    decimal Amount,
    DateTime CreatedAtUtc);
