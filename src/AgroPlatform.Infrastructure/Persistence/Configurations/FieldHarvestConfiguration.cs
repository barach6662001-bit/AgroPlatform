using AgroPlatform.Domain.Fields;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgroPlatform.Infrastructure.Persistence.Configurations;

public class FieldHarvestConfiguration : IEntityTypeConfiguration<FieldHarvest>
{
    public void Configure(EntityTypeBuilder<FieldHarvest> builder)
    {
        builder.HasKey(h => h.Id);

        builder.Property(h => h.CropName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(h => h.TotalTons)
            .HasPrecision(18, 4);

        builder.Property(h => h.YieldTonsPerHa)
            .HasPrecision(18, 4);

        builder.Property(h => h.MoisturePercent)
            .HasPrecision(5, 2);

        builder.Property(h => h.PricePerTon)
            .HasPrecision(18, 2);

        builder.Property(h => h.TotalRevenue)
            .HasPrecision(18, 2);

        builder.HasOne(h => h.Field)
            .WithMany(f => f.Harvests)
            .HasForeignKey(h => h.FieldId)
            .HasConstraintName("FK_FieldHarvests_Fields")
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(h => h.FieldId)
            .HasDatabaseName("IX_FieldHarvests_FieldId");

        builder.HasIndex(h => h.TenantId)
            .HasDatabaseName("IX_FieldHarvests_TenantId");

        builder.HasIndex(h => new { h.FieldId, h.Year })
            .HasDatabaseName("IX_FieldHarvests_FieldId_Year");
    }
}
