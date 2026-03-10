using AgroPlatform.Domain.Machinery;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgroPlatform.Infrastructure.Persistence.Configurations;

public class GpsTrackConfiguration : IEntityTypeConfiguration<GpsTrack>
{
    public void Configure(EntityTypeBuilder<GpsTrack> builder)
    {
        builder.ToTable("GpsTracks");

        builder.HasKey(g => g.Id);

        builder.Property(g => g.VehicleId)
            .IsRequired();

        builder.Property(g => g.Lat)
            .IsRequired();

        builder.Property(g => g.Lng)
            .IsRequired();

        builder.Property(g => g.Speed)
            .HasPrecision(10, 2)
            .IsRequired();

        builder.Property(g => g.FuelLevel)
            .HasPrecision(10, 2)
            .IsRequired();

        builder.Property(g => g.Timestamp)
            .IsRequired();

        builder.HasOne(g => g.Vehicle)
            .WithMany()
            .HasForeignKey(g => g.VehicleId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(g => new { g.VehicleId, g.Timestamp });
    }
}
