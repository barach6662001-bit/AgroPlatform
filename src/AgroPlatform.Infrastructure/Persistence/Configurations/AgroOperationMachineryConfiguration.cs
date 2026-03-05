using AgroPlatform.Domain.AgroOperations;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgroPlatform.Infrastructure.Persistence.Configurations;

public class AgroOperationMachineryConfiguration : IEntityTypeConfiguration<AgroOperationMachinery>
{
    public void Configure(EntityTypeBuilder<AgroOperationMachinery> builder)
    {
        builder.HasKey(m => m.Id);

        builder.Property(m => m.HoursWorked)
            .HasPrecision(10, 2);

        builder.Property(m => m.FuelUsed)
            .HasPrecision(10, 2);

        builder.Property(m => m.OperatorName)
            .HasMaxLength(200);

        builder.HasOne(m => m.AgroOperation)
            .WithMany(o => o.MachineryUsed)
            .HasForeignKey(m => m.AgroOperationId);

        builder.HasOne(m => m.Machine)
            .WithMany()
            .HasForeignKey(m => m.MachineId);

        builder.HasQueryFilter(m => !m.IsDeleted);
    }
}
