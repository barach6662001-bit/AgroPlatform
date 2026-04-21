using AgroPlatform.Domain.Machinery;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgroPlatform.Infrastructure.Persistence.Configurations;

public class FuelLogConfiguration : IEntityTypeConfiguration<FuelLog>
{
    public void Configure(EntityTypeBuilder<FuelLog> builder)
    {
        builder.HasKey(f => f.Id);

        builder.Property(f => f.Date)
            .IsRequired();

        builder.Property(f => f.Quantity)
            .HasPrecision(10, 2)
            .IsRequired();

        builder.Property(f => f.FuelType)
            .HasConversion<string>();

        builder.Property(f => f.Note)
            .HasMaxLength(500);

        builder.HasOne(f => f.Machine)
            .WithMany(m => m.FuelLogs)
            .HasForeignKey(f => f.MachineId);

        builder.HasQueryFilter(f => !f.IsDeleted);

        builder.HasIndex(f => new { f.MachineId, f.Date });
    }
}
