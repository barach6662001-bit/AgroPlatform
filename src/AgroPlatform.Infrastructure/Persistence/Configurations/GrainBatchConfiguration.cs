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

        builder.Property(b => b.ImpurityPercent).HasPrecision(5, 2);
        builder.Property(b => b.GrainImpurityPercent).HasPrecision(5, 2);
        builder.Property(b => b.ProteinPercent).HasPrecision(5, 2);
        builder.Property(b => b.GlutenPercent).HasPrecision(5, 2);

        builder.HasOne(b => b.SourceField)
            .WithMany()
            .HasForeignKey(b => b.SourceFieldId)
            .OnDelete(DeleteBehavior.SetNull)
            .IsRequired(false);

        builder.HasMany(b => b.Movements)
            .WithOne(m => m.GrainBatch)
            .HasForeignKey(m => m.GrainBatchId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(b => b.RowVersion)
            .IsRequired()
            .IsConcurrencyToken()
            .HasDefaultValueSql("'\\x00'::bytea");

        builder.HasIndex(b => b.TenantId);
    }
}
