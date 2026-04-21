using AgroPlatform.Domain.Fields;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgroPlatform.Infrastructure.Persistence.Configurations;

public class FieldFertilizerConfiguration : IEntityTypeConfiguration<FieldFertilizer>
{
    public void Configure(EntityTypeBuilder<FieldFertilizer> builder)
    {
        builder.HasKey(f => f.Id);

        builder.Property(f => f.FertilizerName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(f => f.ApplicationType)
            .HasMaxLength(50);

        builder.Property(f => f.RateKgPerHa)
            .HasPrecision(18, 4);

        builder.Property(f => f.TotalKg)
            .HasPrecision(18, 4);

        builder.Property(f => f.CostPerKg)
            .HasPrecision(18, 2);

        builder.Property(f => f.TotalCost)
            .HasPrecision(18, 2);

        builder.HasOne(f => f.Field)
            .WithMany(fi => fi.Fertilizers)
            .HasForeignKey(f => f.FieldId)
            .HasConstraintName("FK_FieldFertilizers_Fields")
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(f => f.FieldId)
            .HasDatabaseName("IX_FieldFertilizers_FieldId");

        builder.HasIndex(f => f.TenantId)
            .HasDatabaseName("IX_FieldFertilizers_TenantId");
    }
}
