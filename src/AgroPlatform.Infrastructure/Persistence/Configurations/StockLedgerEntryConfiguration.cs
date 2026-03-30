using AgroPlatform.Domain.Warehouses;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgroPlatform.Infrastructure.Persistence.Configurations;

public class StockLedgerEntryConfiguration : IEntityTypeConfiguration<StockLedgerEntry>
{
    public void Configure(EntityTypeBuilder<StockLedgerEntry> builder)
    {
        builder.HasKey(e => e.Id);

        builder.Property(e => e.Quantity)
            .HasPrecision(18, 4);

        builder.Property(e => e.QuantityBase)
            .HasPrecision(18, 4);

        builder.Property(e => e.BalanceAfterBase)
            .HasPrecision(18, 4);

        builder.Property(e => e.TotalCost)
            .HasPrecision(18, 2);

        builder.Property(e => e.UnitCode)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(e => e.BaseUnit)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(e => e.DocumentRef)
            .HasMaxLength(200);

        builder.Property(e => e.Note)
            .HasMaxLength(1000);

        // Useful query patterns: per-warehouse-item timeline, per-operation lookup
        builder.HasIndex(e => new { e.WarehouseId, e.ItemId, e.CreatedAtUtc });
        builder.HasIndex(e => e.OperationId)
            .HasFilter("\"OperationId\" IS NOT NULL");
        builder.HasIndex(e => e.StockMoveId)
            .HasFilter("\"StockMoveId\" IS NOT NULL");

        builder.ToTable("StockLedgerEntries");
    }
}
