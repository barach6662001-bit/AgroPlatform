using AgroPlatform.Domain.Seasons;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgroPlatform.Infrastructure.Persistence.Configurations;

public class SeasonConfiguration : IEntityTypeConfiguration<Season>
{
    public void Configure(EntityTypeBuilder<Season> builder)
    {
        builder.HasKey(s => s.Id);

        builder.Property(s => s.Code).IsRequired().HasMaxLength(16);
        builder.Property(s => s.Name).IsRequired().HasMaxLength(100);
        builder.Property(s => s.StartDate).IsRequired();
        builder.Property(s => s.EndDate).IsRequired();
        builder.Property(s => s.IsCurrent).IsRequired();

        builder.HasQueryFilter(s => !s.IsDeleted);

        builder.HasIndex(s => new { s.TenantId, s.Code })
            .IsUnique()
            .HasFilter("\"IsDeleted\" = false");

        // Only one current season per tenant (enforced at DB level).
        builder.HasIndex(s => new { s.TenantId, s.IsCurrent })
            .IsUnique()
            .HasFilter("\"IsCurrent\" = true AND \"IsDeleted\" = false")
            .HasDatabaseName("IX_Seasons_TenantId_IsCurrent_Unique");

        builder.ToTable("Seasons", t =>
        {
            t.HasCheckConstraint("CK_Seasons_EndAfterStart", "\"EndDate\" > \"StartDate\"");
        });
    }
}
