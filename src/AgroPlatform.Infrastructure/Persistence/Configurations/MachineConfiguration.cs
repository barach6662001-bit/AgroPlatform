using AgroPlatform.Domain.Machinery;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgroPlatform.Infrastructure.Persistence.Configurations;

public class MachineConfiguration : IEntityTypeConfiguration<Machine>
{
    public void Configure(EntityTypeBuilder<Machine> builder)
    {
        builder.HasKey(m => m.Id);

        builder.Property(m => m.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(m => m.InventoryNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.HasIndex(m => new { m.InventoryNumber, m.TenantId })
            .IsUnique();

        builder.Property(m => m.Type)
            .HasConversion<string>();

        builder.Property(m => m.Brand)
            .HasMaxLength(100);

        builder.Property(m => m.Model)
            .HasMaxLength(100);

        builder.Property(m => m.Status)
            .HasConversion<string>();

        builder.Property(m => m.FuelType)
            .HasConversion<string>();

        builder.Property(m => m.FuelConsumptionPerHour)
            .HasPrecision(10, 2);

        builder.Property(m => m.AssignedDriverName)
            .HasMaxLength(200);

        builder.HasMany(m => m.WorkLogs)
            .WithOne(w => w.Machine)
            .HasForeignKey(w => w.MachineId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(m => m.FuelLogs)
            .WithOne(f => f.Machine)
            .HasForeignKey(f => f.MachineId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasQueryFilter(m => !m.IsDeleted);
    }
}
