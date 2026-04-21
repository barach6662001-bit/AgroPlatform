using AgroPlatform.Domain.Warehouses;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgroPlatform.Infrastructure.Persistence.Configurations;

public class BatchConfiguration : IEntityTypeConfiguration<Batch>
{
    public void Configure(EntityTypeBuilder<Batch> builder)
    {
        builder.HasKey(b => b.Id);

        builder.Property(b => b.Code)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(b => b.ReceivedDate)
            .IsRequired();

        builder.Property(b => b.SupplierName)
            .HasMaxLength(255);

        builder.Property(b => b.CostPerUnit)
            .HasColumnType("numeric(18,4)");

        builder.HasOne(b => b.Item)
            .WithMany()
            .HasForeignKey(b => b.ItemId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(b => new { b.ItemId, b.ExpiryDate })
            .HasDatabaseName("IX_Batches_ItemId_ExpiryDate");
    }
}
