using AgroPlatform.Domain.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgroPlatform.Infrastructure.Persistence.Configurations;

public class RolePermissionConfiguration : IEntityTypeConfiguration<RolePermission>
{
    public void Configure(EntityTypeBuilder<RolePermission> builder)
    {
        builder.HasKey(r => new { r.RoleName, r.PolicyName });

        builder.Property(r => r.RoleName)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(r => r.PolicyName)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(r => r.IsGranted)
            .HasDefaultValue(true);

        builder.ToTable("RolePermissions");

        // No HasQueryFilter — global reference data, not tenant-scoped
    }
}
