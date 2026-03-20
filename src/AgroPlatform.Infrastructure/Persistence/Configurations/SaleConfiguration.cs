using AgroPlatform.Domain.Economics;
using AgroPlatform.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgroPlatform.Infrastructure.Persistence.Configurations;

public class SaleConfiguration : IEntityTypeConfiguration<Sale>
{
    public void Configure(EntityTypeBuilder<Sale> builder)
    {
        builder.HasKey(s => s.Id);

        builder.Property(s => s.BuyerName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(s => s.ContractNumber)
            .HasMaxLength(100);

        builder.Property(s => s.CropType)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(s => s.QuantityTons)
            .HasPrecision(18, 4)
            .IsRequired();

        builder.Property(s => s.PricePerTon)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(s => s.TotalAmount)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(s => s.PaymentStatus)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.HasOne(s => s.GrainBatch)
            .WithMany()
            .HasForeignKey(s => s.GrainBatchId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(s => new { s.TenantId, s.SaleDate });
        builder.HasIndex(s => new { s.TenantId, s.BuyerName });
    }
}
