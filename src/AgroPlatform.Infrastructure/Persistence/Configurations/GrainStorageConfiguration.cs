using AgroPlatform.Domain.GrainStorage;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgroPlatform.Infrastructure.Persistence.Configurations;

public class GrainStorageConfiguration : IEntityTypeConfiguration<GrainStorage>
{
    public void Configure(EntityTypeBuilder<GrainStorage> builder)
    {
        builder.HasKey(s => s.Id);

        builder.Property(s => s.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(s => s.Code)
            .HasMaxLength(50);

        builder.Property(s => s.Location)
            .HasMaxLength(300);

        builder.Property(s => s.StorageType)
            .HasMaxLength(50);

        builder.Property(s => s.CapacityTons)
            .HasPrecision(18, 2);

        builder.Property(s => s.Notes)
            .HasMaxLength(1000);

        builder.HasMany(s => s.GrainBatches)
            .WithOne(b => b.GrainStorage)
            .HasForeignKey(b => b.GrainStorageId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(s => s.TenantId);
        builder.HasIndex(s => new { s.TenantId, s.Code }).IsUnique().HasFilter("\"Code\" IS NOT NULL AND \"IsDeleted\" = false");
    }
}
