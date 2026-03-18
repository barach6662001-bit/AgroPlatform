using AgroPlatform.Domain.Fields;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgroPlatform.Infrastructure.Persistence.Configurations;

public class FieldProtectionConfiguration : IEntityTypeConfiguration<FieldProtection>
{
    public void Configure(EntityTypeBuilder<FieldProtection> builder)
    {
        builder.HasKey(p => p.Id);

        builder.Property(p => p.ProductName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(p => p.ProtectionType)
            .HasMaxLength(50);

        builder.Property(p => p.RateLPerHa)
            .HasPrecision(18, 4);

        builder.Property(p => p.TotalLiters)
            .HasPrecision(18, 4);

        builder.Property(p => p.CostPerLiter)
            .HasPrecision(18, 2);

        builder.Property(p => p.TotalCost)
            .HasPrecision(18, 2);

        builder.HasOne(p => p.Field)
            .WithMany(f => f.Protections)
            .HasForeignKey(p => p.FieldId)
            .HasConstraintName("FK_FieldProtections_Fields")
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(p => p.FieldId)
            .HasDatabaseName("IX_FieldProtections_FieldId");

        builder.HasIndex(p => p.TenantId)
            .HasDatabaseName("IX_FieldProtections_TenantId");
    }
}
