using AgroPlatform.Domain.Economics;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgroPlatform.Infrastructure.Persistence.Configurations;

public class BudgetConfiguration : IEntityTypeConfiguration<Budget>
{
    public void Configure(EntityTypeBuilder<Budget> builder)
    {
        builder.HasKey(b => b.Id);
        builder.Property(b => b.Category).IsRequired().HasMaxLength(100);
        builder.Property(b => b.PlannedAmount).HasPrecision(18, 2);
        builder.Property(b => b.Note).HasMaxLength(500);
        builder.HasQueryFilter(b => !b.IsDeleted);
        builder.HasIndex(b => new { b.TenantId, b.Year, b.Category })
            .IsUnique()
            .HasFilter("\"IsDeleted\" = false");
    }
}
