using AgroPlatform.Domain.Notifications;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgroPlatform.Infrastructure.Persistence.Configurations;

public class PushSubscriptionConfiguration : IEntityTypeConfiguration<PushSubscription>
{
    public void Configure(EntityTypeBuilder<PushSubscription> builder)
    {
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Endpoint).IsRequired().HasMaxLength(2048);
        builder.Property(p => p.P256dhKey).HasMaxLength(512);
        builder.Property(p => p.AuthKey).HasMaxLength(256);
        builder.Property(p => p.UserAgent).HasMaxLength(512);
        builder.HasIndex(p => new { p.TenantId, p.Endpoint }).IsUnique();
    }
}
