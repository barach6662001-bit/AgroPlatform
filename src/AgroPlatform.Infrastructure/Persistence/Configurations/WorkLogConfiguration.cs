using AgroPlatform.Domain.HR;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgroPlatform.Infrastructure.Persistence.Configurations;

public class WorkLogConfiguration : IEntityTypeConfiguration<WorkLog>
{
    public void Configure(EntityTypeBuilder<WorkLog> builder)
    {
        builder.HasKey(w => w.Id);

        builder.Property(w => w.HoursWorked)
            .HasPrecision(10, 2);

        builder.Property(w => w.UnitsProduced)
            .HasPrecision(18, 4);

        builder.Property(w => w.AccruedAmount)
            .HasPrecision(18, 2)
            .HasDefaultValue(0m);

        builder.Property(w => w.IsPaid)
            .HasDefaultValue(false);

        builder.Property(w => w.IsDeleted)
            .HasDefaultValue(false);

        builder.HasIndex(w => w.TenantId);
        builder.HasIndex(w => w.EmployeeId);
    }
}
