using AgroPlatform.Domain.Warehouses;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgroPlatform.Infrastructure.Persistence.Configurations;

public class StockBalanceConfiguration : IEntityTypeConfiguration<StockBalance>
{
    public void Configure(EntityTypeBuilder<StockBalance> builder)
    {
        builder.HasKey(b => b.Id);

        builder.Property(b => b.BalanceBase)
            .HasPrecision(18, 4);

        builder.Property(b => b.RowVersion)
            .IsRowVersion();

        builder.HasIndex(sb => new { sb.WarehouseId, sb.ItemId, sb.BatchId, sb.TenantId })
            .IsUnique()
            .HasFilter("\"IsDeleted\" = false");

        builder.HasOne(b => b.Warehouse)
            .WithMany(w => w.Balances)
            .HasForeignKey(b => b.WarehouseId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(b => b.Item)
            .WithMany()
            .HasForeignKey(b => b.ItemId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(b => b.Batch)
            .WithMany()
            .HasForeignKey(b => b.BatchId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
