using MediatR;

namespace AgroPlatform.Application.Common.Queries.GetAuditLog;

public record GetAuditLogQuery(
    string? EntityType = null,
    Guid? UserId = null,
    DateTime? FromDate = null,
    DateTime? ToDate = null,
    int PageNumber = 1,
    int PageSize = 50
) : IRequest<AuditLogResultDto>;

public record AuditEntryDto(
    Guid Id,
    Guid TenantId,
    string UserId,
    string UserEmail,
    DateTime CreatedAtUtc,
    string EntityType,
    Guid EntityId,
    string Action,
    string? OldValues,
    string? NewValues,
    string? IpAddress,
    string? Notes
);

public record AuditLogResultDto(
    List<AuditEntryDto> Entries,
    int Total,
    int PageNumber,
    int PageSize
);
