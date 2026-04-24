using AgroPlatform.Domain.Users;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgroPlatform.Infrastructure.Persistence.Configurations;

public class UserPreferencesConfiguration : IEntityTypeConfiguration<UserPreferences>
{
    public void Configure(EntityTypeBuilder<UserPreferences> builder)
    {
        builder.ToTable("UserPreferences");

        builder.HasKey(x => x.UserId);

        builder.Property(x => x.UserId).IsRequired().HasMaxLength(450);
        builder.Property(x => x.PreferredCurrency).IsRequired().HasMaxLength(3).HasDefaultValue("UAH");
        builder.Property(x => x.UpdatedAtUtc).IsRequired();

        builder.HasOne<AppUser>()
            .WithOne()
            .HasForeignKey<UserPreferences>(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
