using AgroPlatform.Domain.Fields;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AgroPlatform.Infrastructure.Persistence.Configurations;

public class FieldConfiguration : IEntityTypeConfiguration<Field>
{
    public void Configure(EntityTypeBuilder<Field> builder)
    {
        builder.HasKey(f => f.Id);

        builder.Property(f => f.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(f => f.CadastralNumber)
            .HasMaxLength(50);

        builder.Property(f => f.AreaHectares)
            .HasPrecision(12, 4)
            .IsRequired();

        builder.Property(f => f.GeoJson)
            .HasColumnType("text");

        builder.Property(f => f.Geometry)
            .HasColumnType("geometry(Polygon, 4326)")
            .HasColumnName("Geometry");

        builder.Property(f => f.SoilType)
            .HasMaxLength(100);

        builder.Property(f => f.CurrentCrop)
            .HasConversion<string>();

        builder.HasMany(f => f.CropHistory)
            .WithOne(h => h.Field)
            .HasForeignKey(h => h.FieldId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(f => f.Operations)
            .WithOne(o => o.Field)
            .HasForeignKey(o => o.FieldId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(f => f.RotationPlans)
            .WithOne(p => p.Field)
            .HasForeignKey(p => p.FieldId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasQueryFilter(f => !f.IsDeleted);

        builder.HasIndex(f => f.CadastralNumber);

        builder.HasIndex(f => new { f.Name, f.TenantId })
            .IsUnique();
    }
}
