using AgroPlatform.Domain.Economics;
using AgroPlatform.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgroPlatform.Infrastructure.Persistence.Configurations;

public class CostRecordConfiguration : IEntityTypeConfiguration<CostRecord>
{
    public void Configure(EntityTypeBuilder<CostRecord> builder)
    {
        builder.HasKey(c => c.Id);

        builder.Property(c => c.Category)
            .IsRequired()
            .HasMaxLength(50)
            .HasConversion<string>();

        builder.Property(c => c.Amount)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(c => c.Currency)
            .IsRequired()
            .HasMaxLength(10);

        builder.Property(c => c.Date)
            .IsRequired();

        builder.Property(c => c.Description)
            .HasMaxLength(500);

        builder.HasOne(c => c.Field)
            .WithMany()
            .HasForeignKey(c => c.FieldId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(c => c.AgroOperation)
            .WithMany()
            .HasForeignKey(c => c.AgroOperationId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasQueryFilter(c => !c.IsDeleted);

        builder.HasIndex(c => new { c.TenantId, c.Date });
    }
}
