using System.Text.Json;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Audit;
using AgroPlatform.Domain.Common;
using AgroPlatform.Domain.GrainStorage;
using AgroPlatform.Domain.Warehouses;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace AgroPlatform.Infrastructure.Persistence.Interceptors;

public class AuditLogInterceptor : SaveChangesInterceptor
{
    private readonly ICurrentUserService _currentUserService;

    private static readonly HashSet<string> MovementEntityTypes = new()
    {
        nameof(StockMove),
        nameof(GrainMovement),
        nameof(GrainBatch),
    };

    public AuditLogInterceptor(ICurrentUserService currentUserService)
    {
        _currentUserService = currentUserService;
    }

    public override InterceptionResult<int> SavingChanges(DbContextEventData eventData, InterceptionResult<int> result)
    {
        AddAuditLogs(eventData.Context);
        return base.SavingChanges(eventData, result);
    }

    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData,
        InterceptionResult<int> result,
        CancellationToken cancellationToken = default)
    {
        AddAuditLogs(eventData.Context);
        return base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    private void AddAuditLogs(DbContext? context)
    {
        if (context == null) return;

        var userId = _currentUserService.UserId ?? string.Empty;
        var tenantId = _currentUserService.TenantId;
        var now = DateTime.UtcNow;

        var auditLogs = new List<AuditLog>();

        foreach (var entry in context.ChangeTracker.Entries<AuditableEntity>().ToList())
        {
            var entityType = entry.Entity.GetType().Name;
            string? action = null;

            switch (entry.State)
            {
                case EntityState.Added when MovementEntityTypes.Contains(entityType):
                    action = "Created";
                    break;

                case EntityState.Modified:
                    var isDeletedProp = entry.Properties
                        .FirstOrDefault(p => p.Metadata.Name == "IsDeleted");
                    var wasSoftDeleted = isDeletedProp != null
                        && (isDeletedProp.CurrentValue as bool?) == true
                        && (isDeletedProp.OriginalValue as bool?) == false;
                    action = wasSoftDeleted ? "Deleted" : "Updated";
                    break;
            }

            if (action == null) continue;

            var entityId = entry.Properties
                .FirstOrDefault(p => p.Metadata.Name == "Id")
                ?.CurrentValue?.ToString();

            auditLogs.Add(new AuditLog
            {
                UserId = userId,
                Action = action,
                EntityType = entityType,
                EntityId = entityId,
                Timestamp = now,
                TenantId = tenantId,
                Metadata = BuildMetadata(entry)
            });
        }

        if (auditLogs.Count > 0)
            context.AddRange(auditLogs);
    }

    private static string? BuildMetadata(EntityEntry entry)
    {
        try
        {
            Dictionary<string, string?> dict;

            if (entry.State == EntityState.Added)
            {
                dict = entry.Properties
                    .Where(p => !p.IsTemporary
                        && p.Metadata.Name != "IsDeleted"
                        && p.Metadata.Name != "TenantId"
                        && p.Metadata.Name != "Id")
                    .Take(15)
                    .ToDictionary(p => p.Metadata.Name, p => p.CurrentValue?.ToString());
            }
            else
            {
                dict = entry.Properties
                    .Where(p => p.IsModified
                        && p.Metadata.Name != "UpdatedAtUtc"
                        && p.Metadata.Name != "UpdatedBy"
                        && p.Metadata.Name != "IsDeleted"
                        && p.Metadata.Name != "DeletedAtUtc")
                    .Take(15)
                    .ToDictionary(p => p.Metadata.Name, p => p.CurrentValue?.ToString());
            }

            return dict.Count > 0 ? JsonSerializer.Serialize(dict) : null;
        }
        catch
        {
            return null;
        }
    }
}
