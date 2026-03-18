using AgroPlatform.Domain.Fields;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgroPlatform.Infrastructure.Persistence.Configurations;

public class LeasePaymentConfiguration : IEntityTypeConfiguration<LeasePayment>
{
    public void Configure(EntityTypeBuilder<LeasePayment> builder)
    {
        builder.HasKey(p => p.Id);

        builder.Property(p => p.Amount)
            .HasPrecision(18, 2);

        builder.Property(p => p.PaymentType)
            .HasMaxLength(20)
            .HasDefaultValue("Payment");

        builder.Property(p => p.PaymentMethod)
            .HasMaxLength(10)
            .HasDefaultValue("Cash");

        builder.Property(p => p.GrainQuantityTons)
            .HasPrecision(18, 4);

        builder.Property(p => p.GrainPricePerTon)
            .HasPrecision(18, 2);

        builder.HasOne(p => p.GrainBatch)
            .WithMany()
            .HasForeignKey(p => p.GrainBatchId)
            .HasConstraintName("FK_LeasePayments_GrainBatches")
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(p => p.LandLeaseId)
            .HasDatabaseName("IX_LeasePayments_LandLeaseId");
    }
}
