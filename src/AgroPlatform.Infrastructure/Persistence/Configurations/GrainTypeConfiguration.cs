using AgroPlatform.Domain.GrainStorage;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgroPlatform.Infrastructure.Persistence.Configurations;

public class GrainTypeConfiguration : IEntityTypeConfiguration<GrainType>
{
    public void Configure(EntityTypeBuilder<GrainType> builder)
    {
        builder.HasKey(g => g.Id);

        builder.Property(g => g.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(g => g.Description)
            .HasMaxLength(500);

        builder.HasIndex(g => g.TenantId);
        builder.HasIndex(g => new { g.TenantId, g.Name }).IsUnique();
    }
}
