using AgroPlatform.Domain.Sales;
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

        builder.Property(s => s.Product)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(s => s.Quantity)
            .HasPrecision(18, 4)
            .IsRequired();

        builder.Property(s => s.Unit)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(s => s.PricePerUnit)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(s => s.TotalAmount)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(s => s.Currency)
            .IsRequired()
            .HasMaxLength(10);

        builder.Property(s => s.Notes)
            .HasMaxLength(1000);

        builder.HasOne(s => s.Field)
            .WithMany()
            .HasForeignKey(s => s.FieldId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(s => s.GrainMovement)
            .WithMany()
            .HasForeignKey(s => s.GrainMovementId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasQueryFilter(s => !s.IsDeleted);

        builder.HasIndex(s => new { s.TenantId, s.Date });
        builder.HasIndex(s => s.GrainMovementId).HasFilter("\"GrainMovementId\" IS NOT NULL");
    }
}
