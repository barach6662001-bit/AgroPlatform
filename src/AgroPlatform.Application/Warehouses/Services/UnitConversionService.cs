using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Warehouses.Services;

public class UnitConversionService : IUnitConversionService
{
    private readonly IAppDbContext _context;

    public UnitConversionService(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<decimal> ConvertAsync(
        decimal quantity,
        string fromUnit,
        string toUnit,
        CancellationToken cancellationToken = default)
    {
        if (string.Equals(fromUnit, toUnit, StringComparison.OrdinalIgnoreCase))
            return quantity;

        var rule = await _context.UnitConversionRules
            .AsNoTracking()
            .FirstOrDefaultAsync(
                r => r.FromUnit == fromUnit && r.ToUnit == toUnit,
                cancellationToken);

        if (rule is null)
            throw new ConflictException(
                $"No unit conversion rule found from '{fromUnit}' to '{toUnit}'. " +
                "Ensure the units are compatible and a conversion rule exists in the database.");

        return quantity * rule.Factor;
    }
}
