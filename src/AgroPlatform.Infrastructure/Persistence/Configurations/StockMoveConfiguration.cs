using AgroPlatform.Domain.Warehouses;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgroPlatform.Infrastructure.Persistence.Configurations;

public class StockMoveConfiguration : IEntityTypeConfiguration<StockMove>
{
    public void Configure(EntityTypeBuilder<StockMove> builder)
    {
        builder.HasKey(m => m.Id);

        builder.Property(m => m.Quantity)
            .HasPrecision(18, 4);

        builder.Property(m => m.QuantityBase)
            .HasPrecision(18, 4);

        builder.HasOne(m => m.Warehouse)
            .WithMany(w => w.StockMoves)
            .HasForeignKey(m => m.WarehouseId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(m => m.Item)
            .WithMany()
            .HasForeignKey(m => m.ItemId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(m => m.Batch)
            .WithMany()
            .HasForeignKey(m => m.BatchId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(m => new { m.WarehouseId, m.ItemId });

        builder.HasIndex(m => m.ClientOperationId)
            .IsUnique()
            .HasFilter("\"ClientOperationId\" IS NOT NULL");
    }
}
