namespace AgroPlatform.Domain.Warehouses;

/// <summary>
/// Global reference entity defining a multiplicative conversion between two units.
/// Multiply <see cref="Factor"/> by a quantity in <see cref="FromUnit"/> to obtain
/// the equivalent quantity in <see cref="ToUnit"/>.
/// Not tenant-scoped.
/// </summary>
public class UnitConversionRule
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string FromUnit { get; set; } = string.Empty;
    public string ToUnit { get; set; } = string.Empty;

    /// <summary>Multiply by this factor to convert FromUnit → ToUnit.</summary>
    public decimal Factor { get; set; }

    public UnitOfMeasure? From { get; set; }
    public UnitOfMeasure? To { get; set; }
}
