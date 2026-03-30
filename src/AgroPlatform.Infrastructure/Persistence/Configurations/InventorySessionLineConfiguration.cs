using AgroPlatform.Domain.Warehouses;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgroPlatform.Infrastructure.Persistence.Configurations;

public class InventorySessionLineConfiguration : IEntityTypeConfiguration<InventorySessionLine>
{
    public void Configure(EntityTypeBuilder<InventorySessionLine> builder)
    {
        builder.HasKey(l => l.Id);

        builder.Property(l => l.ExpectedQuantityBase)
            .HasPrecision(18, 4);

        builder.Property(l => l.ActualQuantityBase)
            .HasPrecision(18, 4);

        builder.Property(l => l.BaseUnit)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(l => l.Note)
            .HasMaxLength(1000);

        builder.HasOne(l => l.Session)
            .WithMany(s => s.Lines)
            .HasForeignKey(l => l.InventorySessionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(l => l.Item)
            .WithMany()
            .HasForeignKey(l => l.ItemId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.ToTable("InventorySessionLines");
    }
}
