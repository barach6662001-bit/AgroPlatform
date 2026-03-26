using AgroPlatform.Domain.GrainStorage;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgroPlatform.Infrastructure.Persistence.Configurations;

public class GrainBatchConfiguration : IEntityTypeConfiguration<GrainBatch>
{
    public void Configure(EntityTypeBuilder<GrainBatch> builder)
    {
        builder.HasKey(b => b.Id);

        builder.Property(b => b.GrainType)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(b => b.QuantityTons)
            .HasPrecision(18, 4);

        builder.Property(b => b.InitialQuantityTons)
            .HasPrecision(18, 4);

        builder.Property(b => b.ContractNumber)
            .HasMaxLength(100);

        builder.Property(b => b.PricePerTon)
            .HasPrecision(18, 2);

        builder.Property(b => b.MoisturePercent)
            .HasPrecision(5, 2);

        builder.HasOne(b => b.SourceField)
            .WithMany()
            .HasForeignKey(b => b.SourceFieldId)
            .OnDelete(DeleteBehavior.SetNull)
            .IsRequired(false);

        builder.HasOne(b => b.GrainStorage)
            .WithMany(s => s.GrainBatches)
            .HasForeignKey(b => b.GrainStorageId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(b => b.Movements)
            .WithOne(m => m.GrainBatch)
            .HasForeignKey(m => m.GrainBatchId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(b => b.TenantId);
        builder.HasIndex(b => b.GrainStorageId);
    }
}
