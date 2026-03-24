using AgroPlatform.Application.Common.Models;
using MediatR;

namespace AgroPlatform.Application.AuditLog.Queries.GetAuditLogs;

public record GetAuditLogsQuery(
    string? UserId,
    DateTime? DateFrom,
    DateTime? DateTo,
    string? EntityType,
    string? Action,
    int Page = 1,
    int PageSize = 50
) : IRequest<PaginatedResult<AuditLogDto>>;
