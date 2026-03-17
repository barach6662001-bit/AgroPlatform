using AgroPlatform.Domain.Fields;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgroPlatform.Infrastructure.Persistence.Configurations;

public class LandLeaseConfiguration : IEntityTypeConfiguration<LandLease>
{
    public void Configure(EntityTypeBuilder<LandLease> builder)
    {
        builder.HasKey(l => l.Id);

        builder.Property(l => l.OwnerName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(l => l.OwnerPhone)
            .HasMaxLength(50);

        builder.Property(l => l.ContractNumber)
            .HasMaxLength(100);

        builder.Property(l => l.AnnualPayment)
            .HasPrecision(18, 2);

        builder.Property(l => l.PaymentType)
            .HasMaxLength(20)
            .HasDefaultValue("Cash");

        builder.Property(l => l.GrainPaymentTons)
            .HasPrecision(18, 4);

        builder.Property(l => l.IsActive)
            .HasDefaultValue(true);

        builder.HasOne(l => l.Field)
            .WithMany(f => f.LandLeases)
            .HasForeignKey(l => l.FieldId)
            .HasConstraintName("FK_LandLeases_Fields")
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(l => l.Payments)
            .WithOne(p => p.LandLease)
            .HasForeignKey(p => p.LandLeaseId)
            .HasConstraintName("FK_LeasePayments_LandLeases")
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(l => l.FieldId)
            .HasDatabaseName("IX_LandLeases_FieldId");

        builder.HasIndex(l => l.TenantId)
            .HasDatabaseName("IX_LandLeases_TenantId");
    }
}
