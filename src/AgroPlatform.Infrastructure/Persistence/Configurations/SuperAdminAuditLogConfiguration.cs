using AgroPlatform.Domain.SuperAdmin;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgroPlatform.Infrastructure.Persistence.Configurations;

public class SuperAdminAuditLogConfiguration : IEntityTypeConfiguration<SuperAdminAuditLog>
{
    public void Configure(EntityTypeBuilder<SuperAdminAuditLog> builder)
    {
        builder.ToTable("SuperAdminAuditLogs");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.AdminUserId)
            .IsRequired()
            .HasMaxLength(450);

        builder.Property(x => x.Action)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(x => x.TargetType).HasMaxLength(50);
        builder.Property(x => x.TargetId).HasMaxLength(100);
        builder.Property(x => x.IpAddress).HasMaxLength(64);
        builder.Property(x => x.UserAgent).HasMaxLength(512);

        builder.Property(x => x.Before).HasColumnType("jsonb");
        builder.Property(x => x.After).HasColumnType("jsonb");

        builder.HasIndex(x => x.OccurredAt);
        builder.HasIndex(x => x.AdminUserId);
    }
}
