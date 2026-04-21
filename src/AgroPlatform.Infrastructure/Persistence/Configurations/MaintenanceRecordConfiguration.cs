using AgroPlatform.Domain.Machinery;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgroPlatform.Infrastructure.Persistence.Configurations;

public class MaintenanceRecordConfiguration : IEntityTypeConfiguration<MaintenanceRecord>
{
    public void Configure(EntityTypeBuilder<MaintenanceRecord> builder)
    {
        builder.HasKey(m => m.Id);
        builder.Property(m => m.Type).IsRequired().HasMaxLength(50);
        builder.Property(m => m.Description).HasMaxLength(500);
        builder.Property(m => m.Cost).HasPrecision(18, 2);
        builder.Property(m => m.HoursAtMaintenance).HasPrecision(10, 2);
        builder.HasOne(m => m.Machine)
            .WithMany(machine => machine.MaintenanceRecords)
            .HasForeignKey(m => m.MachineId)
            .OnDelete(DeleteBehavior.Cascade);
        builder.HasQueryFilter(m => !m.IsDeleted);
        builder.HasIndex(m => m.MachineId);
    }
}
