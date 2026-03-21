using AgroPlatform.Domain.Fields;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgroPlatform.Infrastructure.Persistence.Configurations;

public class FieldZoneConfiguration : IEntityTypeConfiguration<FieldZone>
{
    public void Configure(EntityTypeBuilder<FieldZone> builder)
    {
        builder.HasKey(z => z.Id);

        builder.Property(z => z.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(z => z.GeoJson)
            .HasColumnType("text");

        builder.Property(z => z.SoilType)
            .HasMaxLength(100);

        builder.HasOne(z => z.Field)
            .WithMany(f => f.Zones)
            .HasForeignKey(z => z.FieldId)
            .HasConstraintName("FK_FieldZones_Fields")
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(z => z.FieldId)
            .HasDatabaseName("IX_FieldZones_FieldId");

        builder.HasIndex(z => z.TenantId)
            .HasDatabaseName("IX_FieldZones_TenantId");
    }
}
