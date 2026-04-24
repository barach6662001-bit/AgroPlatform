using AgroPlatform.Domain.Economics;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgroPlatform.Infrastructure.Persistence.Configurations;

public class ExchangeRateConfiguration : IEntityTypeConfiguration<ExchangeRate>
{
    public void Configure(EntityTypeBuilder<ExchangeRate> builder)
    {
        builder.ToTable("ExchangeRates");

        builder.HasKey(x => new { x.Code, x.Date });

        builder.Property(x => x.Code).IsRequired().HasMaxLength(3);
        builder.Property(x => x.Date).IsRequired();
        builder.Property(x => x.RateToUah).IsRequired().HasColumnType("numeric(18,6)");
        builder.Property(x => x.FetchedAtUtc).IsRequired();

        builder.HasIndex(x => x.Date);
    }
}
