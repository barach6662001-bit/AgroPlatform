using System.Text.Json;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.SuperAdmin;
using Microsoft.AspNetCore.Http;

namespace AgroPlatform.Infrastructure.Services;

public sealed class SuperAdminAuditService : ISuperAdminAuditService
{
    private static readonly JsonSerializerOptions JsonOpts = new() { WriteIndented = false };

    private readonly IAppDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IHttpContextAccessor _http;

    public SuperAdminAuditService(IAppDbContext db, ICurrentUserService currentUser, IHttpContextAccessor http)
    {
        _db = db;
        _currentUser = currentUser;
        _http = http;
    }

    public async Task LogAsync(
        string action,
        string? targetType,
        string? targetId,
        object? before,
        object? after,
        CancellationToken cancellationToken = default)
    {
        var ctx = _http.HttpContext;
        var entry = new SuperAdminAuditLog
        {
            AdminUserId = _currentUser.UserId ?? "unknown",
            Action = action,
            TargetType = targetType,
            TargetId = targetId,
            Before = before is null ? null : JsonSerializer.Serialize(before, JsonOpts),
            After = after is null ? null : JsonSerializer.Serialize(after, JsonOpts),
            IpAddress = ctx?.Connection?.RemoteIpAddress?.ToString(),
            UserAgent = ctx?.Request?.Headers.UserAgent.ToString(),
            OccurredAt = DateTime.UtcNow,
        };

        _db.SuperAdminAuditLogs.Add(entry);
        await _db.SaveChangesAsync(cancellationToken);
    }
}
