using AgroPlatform.Domain.AgroOperations;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgroPlatform.Infrastructure.Persistence.Configurations;

public class AgroOperationResourceConfiguration : IEntityTypeConfiguration<AgroOperationResource>
{
    public void Configure(EntityTypeBuilder<AgroOperationResource> builder)
    {
        builder.HasKey(r => r.Id);

        builder.Property(r => r.PlannedQuantity)
            .HasPrecision(18, 4);

        builder.Property(r => r.ActualQuantity)
            .HasPrecision(18, 4);

        builder.Property(r => r.UnitCode)
            .IsRequired()
            .HasMaxLength(20);

        builder.HasOne(r => r.AgroOperation)
            .WithMany(o => o.Resources)
            .HasForeignKey(r => r.AgroOperationId);

        builder.HasOne(r => r.WarehouseItem)
            .WithMany()
            .HasForeignKey(r => r.WarehouseItemId);

        builder.Property(r => r.WarehouseId)
            .IsRequired();

        builder.HasQueryFilter(r => !r.IsDeleted);
    }
}
