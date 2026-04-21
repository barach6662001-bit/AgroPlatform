using AgroPlatform.Domain.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgroPlatform.Infrastructure.Persistence.Configurations;

public class AuditEntryConfiguration : IEntityTypeConfiguration<AuditEntry>
{
    public void Configure(EntityTypeBuilder<AuditEntry> builder)
    {
        builder.HasKey(a => a.Id);

        builder.Property(a => a.Action)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(a => a.EntityType)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(a => a.EntityId)
            .IsRequired();

        builder.Property(a => a.UserId)
            .IsRequired()
            .HasMaxLength(450);

        builder.Property(a => a.OldValues)
            .HasColumnType("text");

        builder.Property(a => a.NewValues)
            .HasColumnType("text");

        builder.Property(a => a.AffectedColumns)
            .HasColumnType("text");

        builder.Property(a => a.Notes)
            .HasColumnType("text");

        builder.HasIndex(a => a.TenantId)
            .HasDatabaseName("IX_AuditEntries_TenantId");

        builder.HasIndex(a => new { a.TenantId, a.CreatedAtUtc })
            .HasDatabaseName("IX_AuditEntries_TenantId_CreatedAtUtc");
    }
}
