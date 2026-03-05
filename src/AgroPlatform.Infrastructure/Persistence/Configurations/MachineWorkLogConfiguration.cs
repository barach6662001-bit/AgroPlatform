using AgroPlatform.Domain.Machinery;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgroPlatform.Infrastructure.Persistence.Configurations;

public class MachineWorkLogConfiguration : IEntityTypeConfiguration<MachineWorkLog>
{
    public void Configure(EntityTypeBuilder<MachineWorkLog> builder)
    {
        builder.HasKey(w => w.Id);

        builder.Property(w => w.Date)
            .IsRequired();

        builder.Property(w => w.HoursWorked)
            .HasPrecision(10, 2)
            .IsRequired();

        builder.Property(w => w.Description)
            .HasMaxLength(500);

        builder.HasOne(w => w.Machine)
            .WithMany(m => m.WorkLogs)
            .HasForeignKey(w => w.MachineId);

        builder.HasQueryFilter(w => !w.IsDeleted);

        builder.HasIndex(w => new { w.MachineId, w.Date });
    }
}
