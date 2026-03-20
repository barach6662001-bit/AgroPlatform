using AgroPlatform.Domain.Fields;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgroPlatform.Infrastructure.Persistence.Configurations;

public class VraMapConfiguration : IEntityTypeConfiguration<VraMap>
{
    public void Configure(EntityTypeBuilder<VraMap> builder)
    {
        builder.HasKey(m => m.Id);

        builder.Property(m => m.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(m => m.FertilizerName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(m => m.Notes)
            .HasMaxLength(1000);

        builder.HasOne(m => m.Field)
            .WithMany(f => f.VraMaps)
            .HasForeignKey(m => m.FieldId)
            .HasConstraintName("FK_VraMaps_Fields")
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(m => m.FieldId)
            .HasDatabaseName("IX_VraMaps_FieldId");

        builder.HasIndex(m => m.TenantId)
            .HasDatabaseName("IX_VraMaps_TenantId");
    }
}
