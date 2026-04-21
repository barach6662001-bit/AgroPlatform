using System.Text.Json;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace AgroPlatform.Infrastructure.Persistence.Interceptors;

public class AuditInterceptor : SaveChangesInterceptor
{
    private static readonly HashSet<string> _ignoredPropertyNames = new(StringComparer.OrdinalIgnoreCase)
    {
        "CreatedAtUtc",
        "CreatedBy",
        "UpdatedAtUtc",
        "UpdatedBy",
        "DeletedAtUtc",
        "TenantId",
        "IsDeleted",
        "RowVersion",
    };

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
        "GrainStorage",
        "Sale",
        "FuelTransaction",
        "Attachment",
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

            var entityIdRaw = entry.Properties
                .FirstOrDefault(p => p.Metadata.IsPrimaryKey())
                ?.CurrentValue
                ?.ToString() ?? string.Empty;

            var entityId = Guid.TryParse(entityIdRaw, out var parsedEntityId)
                ? parsedEntityId
                : Guid.Empty;

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

            var (oldValues, newValues, affectedColumns, notes) = BuildAuditPayload(entry, action);

            auditEntries.Add(new AuditEntry
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                UserId = userId ?? string.Empty,
                Action = action,
                EntityType = entityType,
                EntityId = entityId,
                CreatedAtUtc = now,
                OldValues = oldValues,
                NewValues = newValues,
                AffectedColumns = affectedColumns,
                Notes = notes,
            });
        }

        if (auditEntries.Any())
        {
            context.Set<AuditEntry>().AddRange(auditEntries);
        }
    }

    private static (string? OldValues, string? NewValues, string? AffectedColumns, string? Notes) BuildAuditPayload(
        Microsoft.EntityFrameworkCore.ChangeTracking.EntityEntry entry,
        string action)
    {
        try
        {
            if (action == "Created")
            {
                var createdProperties = entry.Properties
                    .Where(ShouldTrackProperty)
                    .ToList();

                var newData = createdProperties
                    .ToDictionary(
                        p => p.Metadata.Name,
                        p => (object?)p.CurrentValue);

                return (null, JsonSerializer.Serialize(newData), SerializeAffectedColumns(createdProperties), null);
            }

            if (action == "Deleted")
            {
                var deletedProperties = entry.Properties
                    .Where(ShouldTrackProperty)
                    .ToList();

                var oldData = deletedProperties
                    .ToDictionary(
                        p => p.Metadata.Name,
                        p => (object?)p.OriginalValue);

                return (JsonSerializer.Serialize(oldData), null, SerializeAffectedColumns(deletedProperties), null);
            }

            var changed = entry.Properties
                .Where(p => p.IsModified && ShouldTrackProperty(p))
                .ToList();

            if (changed.Count == 0)
            {
                return (null, null, null, "No modified fields captured");
            }

            var oldValues = changed.ToDictionary(
                p => p.Metadata.Name,
                p => (object?)p.OriginalValue);

            var newValues = changed.ToDictionary(
                p => p.Metadata.Name,
                p => (object?)p.CurrentValue);

            return (
                JsonSerializer.Serialize(oldValues),
                JsonSerializer.Serialize(newValues),
                SerializeAffectedColumns(changed),
                null);
        }
        catch
        {
            return (null, null, null, "Failed to serialize audit payload");
        }
    }

    private static bool ShouldTrackProperty(PropertyEntry property)
    {
        return !property.Metadata.IsPrimaryKey()
            && !property.Metadata.IsShadowProperty()
            && !_ignoredPropertyNames.Contains(property.Metadata.Name);
    }

    private static string SerializeAffectedColumns(IEnumerable<PropertyEntry> properties)
    {
        return JsonSerializer.Serialize(properties.Select(p => p.Metadata.Name).Distinct().OrderBy(name => name));
    }
}
