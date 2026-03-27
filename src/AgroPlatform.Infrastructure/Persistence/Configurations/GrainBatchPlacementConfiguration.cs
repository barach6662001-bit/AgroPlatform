using AgroPlatform.Domain.GrainStorage;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgroPlatform.Infrastructure.Persistence.Configurations;

public class GrainBatchPlacementConfiguration : IEntityTypeConfiguration<GrainBatchPlacement>
{
    public void Configure(EntityTypeBuilder<GrainBatchPlacement> builder)
    {
        builder.HasKey(p => p.Id);

        builder.Property(p => p.QuantityTons)
            .HasPrecision(18, 4);

        builder.HasOne(p => p.GrainBatch)
            .WithMany(b => b.Placements)
            .HasForeignKey(p => p.GrainBatchId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(p => p.GrainStorage)
            .WithMany(s => s.Placements)
            .HasForeignKey(p => p.GrainStorageId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(p => p.TenantId);
        builder.HasIndex(p => p.GrainBatchId);
        builder.HasIndex(p => p.GrainStorageId);
    }
}
