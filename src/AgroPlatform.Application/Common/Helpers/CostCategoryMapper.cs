using AgroPlatform.Domain.Enums;

namespace AgroPlatform.Application.Common.Helpers;

public static class CostCategoryMapper
{
    private static readonly Dictionary<string, CostCategory> Map =
        new(StringComparer.OrdinalIgnoreCase)
        {
            // English
            ["Fertilizers"] = CostCategory.Fertilizer,
            ["Seeds"] = CostCategory.Seeds,
            ["Pesticides"] = CostCategory.Pesticide,
            ["Fuel"] = CostCategory.Fuel,
            ["Machinery"] = CostCategory.Machinery,
            ["Labor"] = CostCategory.Labor,
            ["Lease"] = CostCategory.Lease,
            // Ukrainian (seeded by DataSeeder)
            ["Добрива"] = CostCategory.Fertilizer,
            ["Насіння"] = CostCategory.Seeds,
            ["ЗЗР"] = CostCategory.Pesticide,
            ["ПММ"] = CostCategory.Fuel,
            ["Техніка"] = CostCategory.Machinery,
            ["Праця"] = CostCategory.Labor,
            ["Оренда"] = CostCategory.Lease,
        };

    public static CostCategory FromCategoryName(string? categoryName)
    {
        if (string.IsNullOrWhiteSpace(categoryName))
            return CostCategory.Other;

        return Map.TryGetValue(categoryName, out var result)
            ? result
            : CostCategory.Other;
    }
}
