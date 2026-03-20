using AgroPlatform.Domain.Fields;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgroPlatform.Infrastructure.Persistence.Configurations;

public class VraZoneConfiguration : IEntityTypeConfiguration<VraZone>
{
    public void Configure(EntityTypeBuilder<VraZone> builder)
    {
        builder.HasKey(z => z.Id);

        builder.Property(z => z.ZoneName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(z => z.Color)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(z => z.NdviValue)
            .HasPrecision(5, 4);

        builder.Property(z => z.SoilOrganicMatter)
            .HasPrecision(8, 2);

        builder.Property(z => z.SoilNitrogen)
            .HasPrecision(8, 2);

        builder.Property(z => z.SoilPhosphorus)
            .HasPrecision(8, 2);

        builder.Property(z => z.SoilPotassium)
            .HasPrecision(8, 2);

        builder.Property(z => z.AreaHectares)
            .HasPrecision(18, 4);

        builder.Property(z => z.RateKgPerHa)
            .HasPrecision(10, 2);

        builder.HasOne(z => z.VraMap)
            .WithMany(m => m.Zones)
            .HasForeignKey(z => z.VraMapId)
            .HasConstraintName("FK_VraZones_VraMaps")
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(z => z.VraMapId)
            .HasDatabaseName("IX_VraZones_VraMapId");

        builder.HasIndex(z => z.TenantId)
            .HasDatabaseName("IX_VraZones_TenantId");
    }
}
