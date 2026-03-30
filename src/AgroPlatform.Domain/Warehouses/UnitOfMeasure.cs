namespace AgroPlatform.Domain.Warehouses;

/// <summary>
/// Global reference entity for units of measure. Not tenant-scoped.
/// </summary>
public class UnitOfMeasure
{
    /// <summary>Short unit code used as natural primary key (e.g. "kg", "ton", "L").</summary>
    public string Code { get; set; } = string.Empty;

    /// <summary>Human-readable name (e.g. "Kilogram", "Tonne", "Litre").</summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>Logical grouping: Mass | Volume | Count | Area.</summary>
    public string Category { get; set; } = string.Empty;

    public ICollection<UnitConversionRule> FromRules { get; set; } = new List<UnitConversionRule>();
    public ICollection<UnitConversionRule> ToRules { get; set; } = new List<UnitConversionRule>();
}
