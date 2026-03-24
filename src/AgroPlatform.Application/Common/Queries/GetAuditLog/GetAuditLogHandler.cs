using AgroPlatform.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Common.Queries.GetAuditLog;

public class GetAuditLogHandler : IRequestHandler<GetAuditLogQuery, AuditLogResultDto>
{
    private readonly IAppDbContext _context;

    public GetAuditLogHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<AuditLogResultDto> Handle(GetAuditLogQuery request, CancellationToken cancellationToken)
    {
        var query = _context.AuditEntries.AsQueryable();

        // Tenant isolation (always)
        // Get from context if available, for now we'll assume it's filtered
        // In reality, this should be enforced via middleware or query filter

        if (!string.IsNullOrEmpty(request.EntityType))
            query = query.Where(a => a.EntityType == request.EntityType);

        if (request.UserId.HasValue && request.UserId != Guid.Empty)
            query = query.Where(a => a.UserId == request.UserId.Value.ToString());

        if (request.FromDate.HasValue)
            query = query.Where(a => a.CreatedAtUtc >= request.FromDate.Value);

        if (request.ToDate.HasValue)
            query = query.Where(a => a.CreatedAtUtc <= request.ToDate.Value);

        var total = await query.CountAsync(cancellationToken);

        var entries = await query
            .OrderByDescending(a => a.CreatedAtUtc)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Join(
                _context.Users,
                a => a.UserId,
                u => u.Id,
                (a, u) => new AuditEntryDto(
                    a.Id,
                    a.TenantId,
                    a.UserId,
                    u.Email ?? "unknown",
                    a.CreatedAtUtc,
                    a.EntityType,
                    a.EntityId,
                    a.Action,
                    a.OldValues,
                    a.NewValues,
                    a.IpAddress,
                    a.Notes
                )
            )
            .ToListAsync(cancellationToken);

        return new AuditLogResultDto(entries, total, request.PageNumber, request.PageSize);
    }
}
