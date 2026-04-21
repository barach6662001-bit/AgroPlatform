using AgroPlatform.Domain.HR;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgroPlatform.Infrastructure.Persistence.Configurations;

public class EmployeeConfiguration : IEntityTypeConfiguration<Employee>
{
    public void Configure(EntityTypeBuilder<Employee> builder)
    {
        builder.HasKey(e => e.Id);

        builder.Property(e => e.FirstName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(e => e.LastName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(e => e.Position)
            .HasMaxLength(100);

        builder.Property(e => e.Department)
            .HasMaxLength(100);

        builder.Property(e => e.PhoneNumber)
            .HasMaxLength(50);

        builder.Property(e => e.SalaryType)
            .IsRequired()
            .HasMaxLength(20)
            .HasDefaultValue("Hourly");

        builder.Property(e => e.HourlyRate)
            .HasPrecision(18, 2);

        builder.Property(e => e.PieceworkRate)
            .HasPrecision(18, 2);

        builder.Property(e => e.IsActive)
            .HasDefaultValue(true);

        builder.Property(e => e.IsDeleted)
            .HasDefaultValue(false);

        builder.HasIndex(e => e.TenantId);

        builder.HasMany(e => e.WorkLogs)
            .WithOne(w => w.Employee)
            .HasForeignKey(w => w.EmployeeId)
            .HasConstraintName("FK_WorkLogs_Employees")
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(e => e.Payments)
            .WithOne(p => p.Employee)
            .HasForeignKey(p => p.EmployeeId)
            .HasConstraintName("FK_SalaryPayments_Employees")
            .OnDelete(DeleteBehavior.Cascade);
    }
}
