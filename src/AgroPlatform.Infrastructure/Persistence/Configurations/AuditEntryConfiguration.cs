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
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(a => a.UserId)
            .HasMaxLength(450);

        builder.Property(a => a.Metadata)
            .HasColumnType("text");

        builder.HasIndex(a => a.TenantId)
            .HasDatabaseName("IX_AuditEntries_TenantId");

        builder.HasIndex(a => new { a.TenantId, a.Timestamp })
            .HasDatabaseName("IX_AuditEntries_TenantId_Timestamp");
    }
}
