using AgroPlatform.Domain.GrainStorage;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgroPlatform.Infrastructure.Persistence.Configurations;

public class GrainTransferConfiguration : IEntityTypeConfiguration<GrainTransfer>
{
    public void Configure(EntityTypeBuilder<GrainTransfer> builder)
    {
        builder.HasKey(t => t.Id);

        builder.Property(t => t.QuantityTons)
            .HasPrecision(18, 4);

        builder.Property(t => t.Notes)
            .HasMaxLength(1000);

        builder.HasOne(t => t.SourceBatch)
            .WithMany()
            .HasForeignKey(t => t.SourceBatchId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(t => t.TargetBatch)
            .WithMany()
            .HasForeignKey(t => t.TargetBatchId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(t => t.TenantId);
        builder.HasIndex(t => t.SourceBatchId);
        builder.HasIndex(t => t.TargetBatchId);
    }
}
