using AgroPlatform.Application.Audit.DTOs;
using AgroPlatform.Application.Common.Models;
using MediatR;

namespace AgroPlatform.Application.Audit.Queries.GetAuditLogs;

public class GetAuditLogsQuery : IRequest<PaginatedResult<AuditLogDto>>
{
    public string? UserId { get; set; }
    public DateTime? DateFrom { get; set; }
    public DateTime? DateTo { get; set; }
    public string? EntityType { get; set; }
    public string? Action { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 50;
}
