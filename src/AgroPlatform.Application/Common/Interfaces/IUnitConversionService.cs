namespace AgroPlatform.Application.Common.Interfaces;

/// <summary>
/// Converts quantities between units of measure using DB-driven conversion rules.
/// Same-unit conversions are returned immediately without a DB round-trip.
/// </summary>
public interface IUnitConversionService
{
    /// <summary>
    /// Converts <paramref name="quantity"/> from <paramref name="fromUnit"/> to
    /// <paramref name="toUnit"/>.  Returns the original quantity unchanged when both
    /// units are the same (case-insensitive comparison).
    /// </summary>
    /// <exception cref="Common.Exceptions.ConflictException">
    /// Thrown when no conversion rule exists for the given unit pair.
    /// </exception>
    Task<decimal> ConvertAsync(
        decimal quantity,
        string fromUnit,
        string toUnit,
        CancellationToken cancellationToken = default);
}
