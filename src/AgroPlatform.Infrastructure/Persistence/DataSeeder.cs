using AgroPlatform.Domain.GrainStorage;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace AgroPlatform.Infrastructure.Persistence;

public static class DataSeeder
{
    public static readonly string[] DefaultGrainTypes =
    [
        "Пшениця озима", "Пшениця яра", "Ячмінь", "Кукурудза",
        "Соняшник", "Соя", "Ріпак", "Горох", "Жито", "Овес"
    ];

    public static async Task SeedAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<AppDbContext>>();

        try
        {
            var existingDefaults = await context.GrainTypes
                .IgnoreQueryFilters()
                .Where(g => g.IsDefault && g.TenantId == null)
                .Select(g => g.Name)
                .ToListAsync();

            var toSeed = DefaultGrainTypes
                .Where(name => !existingDefaults.Contains(name))
                .Select(name => new GrainType
                {
                    Name = name,
                    IsDefault = true,
                    TenantId = null,
                })
                .ToList();

            if (toSeed.Count > 0)
            {
                context.GrainTypes.AddRange(toSeed);
                await context.SaveChangesAsync();
                logger.LogInformation("Seeded {Count} default grain types.", toSeed.Count);
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while seeding default grain types.");
        }
    }
}
