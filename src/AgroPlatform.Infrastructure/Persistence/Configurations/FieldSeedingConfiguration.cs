using AgroPlatform.Domain.Fields;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgroPlatform.Infrastructure.Persistence.Configurations;

public class FieldSeedingConfiguration : IEntityTypeConfiguration<FieldSeeding>
{
    public void Configure(EntityTypeBuilder<FieldSeeding> builder)
    {
        builder.HasKey(s => s.Id);

        builder.Property(s => s.CropName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(s => s.Variety)
            .HasMaxLength(200);

        builder.Property(s => s.SeedingRateKgPerHa)
            .HasPrecision(18, 4);

        builder.Property(s => s.TotalSeedKg)
            .HasPrecision(18, 4);

        builder.HasOne(s => s.Field)
            .WithMany(f => f.Seedings)
            .HasForeignKey(s => s.FieldId)
            .HasConstraintName("FK_FieldSeedings_Fields")
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(s => s.FieldId)
            .HasDatabaseName("IX_FieldSeedings_FieldId");

        builder.HasIndex(s => s.TenantId)
            .HasDatabaseName("IX_FieldSeedings_TenantId");
    }
}
