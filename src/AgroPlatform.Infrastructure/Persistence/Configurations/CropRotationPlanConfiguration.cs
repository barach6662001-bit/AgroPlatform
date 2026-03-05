using AgroPlatform.Domain.Fields;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgroPlatform.Infrastructure.Persistence.Configurations;

public class CropRotationPlanConfiguration : IEntityTypeConfiguration<CropRotationPlan>
{
    public void Configure(EntityTypeBuilder<CropRotationPlan> builder)
    {
        builder.HasKey(p => p.Id);

        builder.Property(p => p.PlannedCrop)
            .IsRequired()
            .HasConversion<string>();

        builder.Property(p => p.Year)
            .IsRequired();

        builder.Property(p => p.Notes)
            .HasMaxLength(1000);

        builder.HasOne(p => p.Field)
            .WithMany(f => f.RotationPlans)
            .HasForeignKey(p => p.FieldId);

        builder.HasQueryFilter(p => !p.IsDeleted);

        builder.HasIndex(p => new { p.FieldId, p.Year })
            .IsUnique();
    }
}
