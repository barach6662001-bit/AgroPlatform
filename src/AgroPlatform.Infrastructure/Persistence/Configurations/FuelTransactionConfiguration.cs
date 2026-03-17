using AgroPlatform.Domain.Fuel;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgroPlatform.Infrastructure.Persistence.Configurations;

public class FuelTransactionConfiguration : IEntityTypeConfiguration<FuelTransaction>
{
    public void Configure(EntityTypeBuilder<FuelTransaction> builder)
    {
        builder.HasKey(t => t.Id);

        builder.Property(t => t.TransactionType)
            .IsRequired()
            .HasMaxLength(10);

        builder.Property(t => t.QuantityLiters)
            .HasPrecision(18, 2);

        builder.Property(t => t.PricePerLiter)
            .HasPrecision(18, 4);

        builder.Property(t => t.TotalCost)
            .HasPrecision(18, 2);

        builder.Property(t => t.InvoiceNumber)
            .HasMaxLength(100);

        builder.Property(t => t.IsDeleted)
            .HasDefaultValue(false);

        builder.HasIndex(t => t.FuelTankId);

        builder.HasIndex(t => t.MachineId);

        builder.HasQueryFilter(t => !t.IsDeleted);
    }
}
