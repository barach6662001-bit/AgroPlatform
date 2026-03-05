using AgroPlatform.Domain.Fields;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgroPlatform.Infrastructure.Persistence.Configurations;

public class FieldCropHistoryConfiguration : IEntityTypeConfiguration<FieldCropHistory>
{
    public void Configure(EntityTypeBuilder<FieldCropHistory> builder)
    {
        builder.HasKey(h => h.Id);

        builder.Property(h => h.Crop)
            .IsRequired()
            .HasConversion<string>();

        builder.Property(h => h.Year)
            .IsRequired();

        builder.Property(h => h.YieldPerHectare)
            .HasPrecision(10, 2);

        builder.Property(h => h.Notes)
            .HasMaxLength(1000);

        builder.HasOne(h => h.Field)
            .WithMany(f => f.CropHistory)
            .HasForeignKey(h => h.FieldId);

        builder.HasQueryFilter(h => !h.IsDeleted);

        builder.HasIndex(h => new { h.FieldId, h.Year })
            .IsUnique();
    }
}
