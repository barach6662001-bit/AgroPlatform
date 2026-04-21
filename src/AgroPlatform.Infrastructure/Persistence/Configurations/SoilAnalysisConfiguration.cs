using AgroPlatform.Domain.Fields;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgroPlatform.Infrastructure.Persistence.Configurations;

public class SoilAnalysisConfiguration : IEntityTypeConfiguration<SoilAnalysis>
{
    public void Configure(EntityTypeBuilder<SoilAnalysis> builder)
    {
        builder.HasKey(s => s.Id);

        builder.Property(s => s.pH)
            .HasPrecision(5, 2);

        builder.Property(s => s.Nitrogen)
            .HasPrecision(10, 4);

        builder.Property(s => s.Phosphorus)
            .HasPrecision(10, 4);

        builder.Property(s => s.Potassium)
            .HasPrecision(10, 4);

        builder.Property(s => s.Humus)
            .HasPrecision(10, 4);

        builder.Property(s => s.Notes)
            .HasMaxLength(1000);

        builder.HasOne(s => s.Field)
            .WithMany(f => f.SoilAnalyses)
            .HasForeignKey(s => s.FieldId)
            .HasConstraintName("FK_SoilAnalyses_Fields")
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(s => s.FieldId)
            .HasDatabaseName("IX_SoilAnalyses_FieldId");

        builder.HasIndex(s => s.TenantId)
            .HasDatabaseName("IX_SoilAnalyses_TenantId");
    }
}
