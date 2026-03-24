using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Common.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.AuditLog.Queries.GetAuditLogs;

public class GetAuditLogsHandler : IRequestHandler<GetAuditLogsQuery, PaginatedResult<AuditLogDto>>
{
    private readonly IAppDbContext _context;

    public GetAuditLogsHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<PaginatedResult<AuditLogDto>> Handle(GetAuditLogsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.AuditEntries.AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.UserId))
            query = query.Where(a => a.UserId != null && a.UserId.Contains(request.UserId));

        if (request.DateFrom.HasValue)
            query = query.Where(a => a.Timestamp >= request.DateFrom.Value);

        if (request.DateTo.HasValue)
            query = query.Where(a => a.Timestamp <= request.DateTo.Value);

        if (!string.IsNullOrWhiteSpace(request.EntityType))
            query = query.Where(a => a.EntityType == request.EntityType);

        if (!string.IsNullOrWhiteSpace(request.Action))
            query = query.Where(a => a.Action == request.Action);

        var page = request.Page < 1 ? 1 : request.Page;
        var pageSize = request.PageSize < 1 ? 50 : request.PageSize;

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(a => a.Timestamp)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(a => new AuditLogDto
            {
                Id = a.Id,
                UserId = a.UserId,
                Action = a.Action,
                EntityType = a.EntityType,
                EntityId = a.EntityId,
                Timestamp = a.Timestamp,
                Metadata = a.Metadata,
            })
            .ToListAsync(cancellationToken);

        return new PaginatedResult<AuditLogDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }
}
