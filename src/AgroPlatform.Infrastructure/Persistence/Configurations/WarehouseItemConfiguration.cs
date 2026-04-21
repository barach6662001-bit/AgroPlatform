using AgroPlatform.Domain.Warehouses;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgroPlatform.Infrastructure.Persistence.Configurations;

public class WarehouseItemConfiguration : IEntityTypeConfiguration<WarehouseItem>
{
    public void Configure(EntityTypeBuilder<WarehouseItem> builder)
    {
        builder.HasKey(i => i.Id);

        builder.Property(i => i.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(i => i.Code)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(i => i.Category)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(i => i.BaseUnit)
            .IsRequired()
            .HasMaxLength(20);

        builder.HasIndex(i => new { i.TenantId, i.Code })
            .IsUnique();

        builder.Property(i => i.PurchasePrice)
            .HasPrecision(18, 4);

        builder.HasOne(i => i.ItemCategory)
            .WithMany(c => c.Items)
            .HasForeignKey(i => i.CategoryId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
