using AgroPlatform.Domain.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgroPlatform.Infrastructure.Persistence.Configurations;

public class AttachmentConfiguration : IEntityTypeConfiguration<Attachment>
{
    public void Configure(EntityTypeBuilder<Attachment> builder)
    {
        builder.HasKey(a => a.Id);

        builder.Property(a => a.EntityType)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(a => a.EntityId)
            .IsRequired();

        builder.Property(a => a.FileName)
            .IsRequired()
            .HasMaxLength(260);

        builder.Property(a => a.ContentType)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(a => a.StoragePath)
            .IsRequired()
            .HasMaxLength(1024);

        builder.Property(a => a.Description)
            .HasMaxLength(1000);

        builder.HasIndex(a => new { a.TenantId, a.EntityType, a.EntityId, a.CreatedAtUtc })
            .HasDatabaseName("IX_Attachments_Tenant_Entity_CreatedAtUtc");
    }
}