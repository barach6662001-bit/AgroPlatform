using System.Text.Json;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace AgroPlatform.Infrastructure.Persistence.Interceptors;

public class AuditInterceptor : SaveChangesInterceptor
{
    private static readonly HashSet<string> _trackedEntities = new(StringComparer.OrdinalIgnoreCase)
    {
        "StockMove",
        "Batch",
        "WarehouseItem",
        "Warehouse",
        "AgroOperation",
        "CostRecord",
        "Field",
        "Machine",
        "Employee",
        "GrainMovement",
        "GrainBatch",
        "Sale",
        "FuelTransaction",
    };

    private readonly ICurrentUserService _currentUserService;

    public AuditInterceptor(ICurrentUserService currentUserService)
    {
        _currentUserService = currentUserService;
    }

    public override InterceptionResult<int> SavingChanges(DbContextEventData eventData, InterceptionResult<int> result)
    {
        WriteAuditEntries(eventData.Context);
        return base.SavingChanges(eventData, result);
    }

    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData,
        InterceptionResult<int> result,
        CancellationToken cancellationToken = default)
    {
        WriteAuditEntries(eventData.Context);
        return base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    private void WriteAuditEntries(DbContext? context)
    {
        if (context == null) return;

        var now = DateTime.UtcNow;
        var userId = _currentUserService.UserId;
        var tenantId = _currentUserService.TenantId;

        var auditEntries = new List<AuditEntry>();

        foreach (var entry in context.ChangeTracker.Entries())
        {
            if (entry.State is not (EntityState.Added or EntityState.Modified or EntityState.Deleted))
                continue;

            var entityType = entry.Entity.GetType().Name;
            if (!_trackedEntities.Contains(entityType))
                continue;

            var entityId = entry.Properties
                .FirstOrDefault(p => p.Metadata.IsPrimaryKey())
                ?.CurrentValue
                ?.ToString() ?? string.Empty;

            var action = entry.State switch
            {
                EntityState.Added => "Created",
                EntityState.Modified => "Updated",
                EntityState.Deleted => "Deleted",
                _ => "Unknown"
            };

            // For soft-deleted entities (state Modified but IsDeleted set to true), override action
            if (entry.State == EntityState.Modified)
            {
                var isDeletedProp = entry.Properties.FirstOrDefault(p => p.Metadata.Name == "IsDeleted");
                if (isDeletedProp?.IsModified == true && isDeletedProp.CurrentValue is true)
                {
                    action = "Deleted";
                }
            }

            var metadata = BuildMetadata(entry, action);

            auditEntries.Add(new AuditEntry
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                UserId = userId,
                Action = action,
                EntityType = entityType,
                EntityId = entityId,
                Timestamp = now,
                Metadata = metadata,
            });
        }

        if (auditEntries.Any())
        {
            context.Set<AuditEntry>().AddRange(auditEntries);
        }
    }

    private static string? BuildMetadata(Microsoft.EntityFrameworkCore.ChangeTracking.EntityEntry entry, string action)
    {
        try
        {
            Dictionary<string, object?> data;

            if (action == "Created")
            {
                data = entry.Properties
                    .Where(p => !p.Metadata.IsPrimaryKey())
                    .ToDictionary(
                        p => p.Metadata.Name,
                        p => (object?)p.CurrentValue);
            }
            else if (action == "Deleted")
            {
                data = entry.Properties
                    .Where(p => !p.Metadata.IsPrimaryKey())
                    .ToDictionary(
                        p => p.Metadata.Name,
                        p => (object?)p.OriginalValue);
            }
            else
            {
                var changed = entry.Properties
                    .Where(p => p.IsModified && !p.Metadata.IsPrimaryKey())
                    .ToList();

                if (changed.Count == 0) return null;

                data = changed.ToDictionary(
                    p => p.Metadata.Name,
                    p => (object?)new { Old = p.OriginalValue, New = p.CurrentValue });
            }

            return JsonSerializer.Serialize(data, new JsonSerializerOptions
            {
                WriteIndented = false,
                MaxDepth = 3,
            });
        }
        catch
        {
            return null;
        }
    }
}
