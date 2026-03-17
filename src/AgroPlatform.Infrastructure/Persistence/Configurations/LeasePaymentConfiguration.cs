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

        builder.HasIndex(p => p.LandLeaseId)
            .HasDatabaseName("IX_LeasePayments_LandLeaseId");
    }
}
