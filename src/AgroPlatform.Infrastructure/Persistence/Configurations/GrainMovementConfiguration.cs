using AgroPlatform.Domain.GrainStorage;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgroPlatform.Infrastructure.Persistence.Configurations;

public class GrainMovementConfiguration : IEntityTypeConfiguration<GrainMovement>
{
    public void Configure(EntityTypeBuilder<GrainMovement> builder)
    {
        builder.HasKey(m => m.Id);

        builder.Property(m => m.MovementType)
            .IsRequired()
            .HasMaxLength(10);

        builder.Property(m => m.QuantityTons)
            .HasPrecision(18, 4);

        builder.Property(m => m.PricePerTon)
            .HasPrecision(18, 2);

        builder.Property(m => m.TotalRevenue)
            .HasPrecision(18, 2);
    }
}
