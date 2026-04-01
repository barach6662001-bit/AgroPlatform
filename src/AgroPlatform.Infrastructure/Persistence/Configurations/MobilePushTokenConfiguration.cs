using AgroPlatform.Domain.Notifications;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgroPlatform.Infrastructure.Persistence.Configurations;

public class MobilePushTokenConfiguration : IEntityTypeConfiguration<MobilePushToken>
{
    public void Configure(EntityTypeBuilder<MobilePushToken> builder)
    {
        builder.HasKey(t => t.Id);
        builder.Property(t => t.UserId).IsRequired().HasMaxLength(256);
        builder.Property(t => t.Token).IsRequired().HasMaxLength(512);
        builder.Property(t => t.Platform).IsRequired().HasMaxLength(16);
        builder.HasIndex(t => new { t.TenantId, t.UserId, t.Token }).IsUnique();
    }
}
