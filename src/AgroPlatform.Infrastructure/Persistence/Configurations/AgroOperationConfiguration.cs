using AgroPlatform.Domain.AgroOperations;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgroPlatform.Infrastructure.Persistence.Configurations;

public class AgroOperationConfiguration : IEntityTypeConfiguration<AgroOperation>
{
    public void Configure(EntityTypeBuilder<AgroOperation> builder)
    {
        builder.HasKey(o => o.Id);

        builder.Property(o => o.OperationType)
            .HasConversion<string>();

        builder.Property(o => o.PlannedDate)
            .IsRequired();

        builder.Property(o => o.Description)
            .HasMaxLength(1000);

        builder.Property(o => o.AreaProcessed)
            .HasPrecision(12, 4);

        builder.Property(o => o.PerformedByName)
            .HasMaxLength(200);

        builder.HasOne(o => o.Field)
            .WithMany(f => f.Operations)
            .HasForeignKey(o => o.FieldId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(o => o.Resources)
            .WithOne(r => r.AgroOperation)
            .HasForeignKey(r => r.AgroOperationId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(o => o.MachineryUsed)
            .WithOne(m => m.AgroOperation)
            .HasForeignKey(m => m.AgroOperationId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasQueryFilter(o => !o.IsDeleted);

        builder.HasIndex(o => new { o.FieldId, o.PlannedDate });
        builder.HasIndex(o => new { o.TenantId, o.IsCompleted });
        builder.HasIndex(o => new { o.TenantId, o.FieldId });
    }
}
