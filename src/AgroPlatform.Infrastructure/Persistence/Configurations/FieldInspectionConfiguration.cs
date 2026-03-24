using AgroPlatform.Domain.Fields;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgroPlatform.Infrastructure.Persistence.Configurations;

public class FieldInspectionConfiguration : IEntityTypeConfiguration<FieldInspection>
{
    public void Configure(EntityTypeBuilder<FieldInspection> builder)
    {
        builder.HasKey(i => i.Id);

        builder.Property(i => i.InspectorName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(i => i.Severity)
            .HasMaxLength(50);

        builder.Property(i => i.PhotoUrl)
            .HasMaxLength(2000);

        builder.HasOne(i => i.Field)
            .WithMany(f => f.Inspections)
            .HasForeignKey(i => i.FieldId)
            .HasConstraintName("FK_FieldInspections_Fields")
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(i => i.FieldId)
            .HasDatabaseName("IX_FieldInspections_FieldId");

        builder.HasIndex(i => i.TenantId)
            .HasDatabaseName("IX_FieldInspections_TenantId");
    }
}
