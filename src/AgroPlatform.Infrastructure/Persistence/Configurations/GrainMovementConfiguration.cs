using AgroPlatform.Domain.Enums;
using AgroPlatform.Domain.GrainStorage;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgroPlatform.Infrastructure.Persistence.Configurations;

public class GrainMovementConfiguration : IEntityTypeConfiguration<GrainMovement>
{
    public void Configure(EntityTypeBuilder<GrainMovement> builder)
    {
        builder.HasKey(m => m.Id);

        builder.Property(m => m.MovementType)
            .IsRequired()
            .HasMaxLength(20)
            .HasConversion<string>();

        builder.Property(m => m.QuantityTons)
            .HasPrecision(18, 4);

        builder.Property(m => m.PricePerTon)
            .HasPrecision(18, 2);

        builder.Property(m => m.TotalRevenue)
            .HasPrecision(18, 2);

        builder.Property(m => m.Reason)
            .HasMaxLength(500);

        builder.Property(m => m.Notes)
            .HasMaxLength(1000);

        builder.Property(m => m.BuyerName)
            .HasMaxLength(200);

        builder.HasOne(m => m.SourceStorage)
            .WithMany()
            .HasForeignKey(m => m.SourceStorageId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(m => m.TargetStorage)
            .WithMany()
            .HasForeignKey(m => m.TargetStorageId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(m => m.GrainTransfer)
            .WithMany()
            .HasForeignKey(m => m.GrainTransferId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(m => m.OperationId)
            .HasFilter("\"OperationId\" IS NOT NULL");

        builder.HasIndex(m => new { m.GrainBatchId, m.MovementDate });

        builder.HasIndex(m => m.ClientOperationId)
            .IsUnique()
            .HasFilter("\"ClientOperationId\" IS NOT NULL");
    }
}
