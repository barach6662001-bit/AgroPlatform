using AgroPlatform.Domain.Fuel;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgroPlatform.Infrastructure.Persistence.Configurations;

public class FuelTankConfiguration : IEntityTypeConfiguration<FuelTank>
{
    public void Configure(EntityTypeBuilder<FuelTank> builder)
    {
        builder.HasKey(t => t.Id);

        builder.Property(t => t.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(t => t.FuelType)
            .HasConversion<int>();

        builder.Property(t => t.CapacityLiters)
            .HasPrecision(18, 2);

        builder.Property(t => t.CurrentLiters)
            .HasPrecision(18, 2)
            .HasDefaultValue(0m);

        builder.Property(t => t.PricePerLiter)
            .HasPrecision(18, 4);

        builder.Property(t => t.RowVersion)
            .IsRowVersion();

        builder.Property(t => t.IsActive)
            .HasDefaultValue(true);

        builder.Property(t => t.IsDeleted)
            .HasDefaultValue(false);

        builder.HasIndex(t => t.TenantId);

        builder.HasMany(t => t.Transactions)
            .WithOne(tr => tr.FuelTank)
            .HasForeignKey(tr => tr.FuelTankId)
            .HasConstraintName("FK_FuelTransactions_FuelTanks")
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasQueryFilter(t => !t.IsDeleted);
    }
}
