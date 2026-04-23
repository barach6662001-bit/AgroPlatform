using AgroPlatform.Domain.Users;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgroPlatform.Infrastructure.Persistence.Configurations;

public class UserMfaSettingsConfiguration : IEntityTypeConfiguration<UserMfaSettings>
{
    public void Configure(EntityTypeBuilder<UserMfaSettings> builder)
    {
        builder.ToTable("UserMfaSettings");

        builder.HasKey(x => x.UserId);

        builder.Property(x => x.UserId)
            .IsRequired()
            .HasMaxLength(450);

        builder.Property(x => x.SecretKey)
            .IsRequired()
            .HasMaxLength(32);

        builder.Property(x => x.BackupCodes)
            .IsRequired()
            .HasColumnType("jsonb")
            .HasDefaultValue("[]");

        builder.Property(x => x.IsEnabled)
            .HasDefaultValue(false);

        builder.HasOne<AppUser>()
            .WithOne()
            .HasForeignKey<UserMfaSettings>(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
