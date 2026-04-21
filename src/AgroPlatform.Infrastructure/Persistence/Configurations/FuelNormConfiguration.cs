using AgroPlatform.Domain.Fuel;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgroPlatform.Infrastructure.Persistence.Configurations;

public class FuelNormConfiguration : IEntityTypeConfiguration<FuelNorm>
{
    public void Configure(EntityTypeBuilder<FuelNorm> builder)
    {
        builder.HasKey(n => n.Id);

        builder.Property(n => n.MachineType)
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(n => n.OperationType)
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(n => n.NormLitersPerHa)
            .HasPrecision(10, 3);

        builder.Property(n => n.NormLitersPerHour)
            .HasPrecision(10, 3);

        builder.Property(n => n.Notes)
            .HasMaxLength(500);

        builder.HasIndex(n => new { n.MachineType, n.OperationType, n.TenantId })
            .IsUnique();

        builder.ToTable("FuelNorms");
    }
}
