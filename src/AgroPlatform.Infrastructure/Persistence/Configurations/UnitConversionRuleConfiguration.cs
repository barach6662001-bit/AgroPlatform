using AgroPlatform.Domain.Warehouses;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgroPlatform.Infrastructure.Persistence.Configurations;

public class UnitConversionRuleConfiguration : IEntityTypeConfiguration<UnitConversionRule>
{
    public void Configure(EntityTypeBuilder<UnitConversionRule> builder)
    {
        builder.HasKey(r => r.Id);

        builder.Property(r => r.FromUnit)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(r => r.ToUnit)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(r => r.Factor)
            .IsRequired()
            .HasPrecision(22, 10);

        builder.HasIndex(r => new { r.FromUnit, r.ToUnit })
            .IsUnique();

        builder.HasOne(r => r.From)
            .WithMany(u => u.FromRules)
            .HasForeignKey(r => r.FromUnit)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(r => r.To)
            .WithMany(u => u.ToRules)
            .HasForeignKey(r => r.ToUnit)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
