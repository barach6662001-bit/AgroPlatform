using AgroPlatform.Domain.Users;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgroPlatform.Infrastructure.Persistence.Configurations;

public class TenantConfiguration : IEntityTypeConfiguration<Tenant>
{
    public void Configure(EntityTypeBuilder<Tenant> builder)
    {
        builder.HasKey(t => t.Id);

        builder.Property(t => t.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(t => t.Inn)
            .HasMaxLength(50);

        builder.Property(t => t.CompanyName)
            .HasMaxLength(300);

        builder.Property(t => t.Edrpou)
            .HasMaxLength(20);

        builder.Property(t => t.Address)
            .HasMaxLength(500);

        builder.Property(t => t.Phone)
            .HasMaxLength(50);
    }
}
