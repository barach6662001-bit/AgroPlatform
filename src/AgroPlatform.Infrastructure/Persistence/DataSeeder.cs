using AgroPlatform.Domain.Enums;
using AgroPlatform.Domain.Fields;
using AgroPlatform.Domain.GrainStorage;
using AgroPlatform.Domain.Machinery;
using AgroPlatform.Domain.Users;
using AgroPlatform.Domain.Warehouses;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace AgroPlatform.Infrastructure.Persistence;

public static class DataSeeder
{
    // Fixed demo tenant — same across restarts so seed is idempotent
    public static readonly Guid DemoTenantId = new("aaaaaaaa-0000-0000-0000-000000000001");
    public const string DemoEmail = "demo@agro.local";
    public const string DemoPassword = "DemoPass1";

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

        await SeedGrainTypesAsync(context, logger);
        await SeedDemoAsync(scope.ServiceProvider, context, logger);
    }

    // -------------------------------------------------------------------------
    // Default grain types (global, TenantId = Guid.Empty)
    // -------------------------------------------------------------------------
    private static async Task SeedGrainTypesAsync(AppDbContext context, ILogger logger)
    {
        try
        {
            // Use raw SQL with ON CONFLICT DO NOTHING to bypass EF Core query filters entirely.
            // HasQueryFilter on GrainType causes WHERE FALSE in seeder scope (no active tenant).
            var now = DateTime.UtcNow;
            var emptyTenant = Guid.Empty;
            foreach (var name in DefaultGrainTypes)
            {
                await context.Database.ExecuteSqlAsync(
                    $"""
                    INSERT INTO "GrainTypes" ("Id","Name","IsDefault","IsDeleted","TenantId","CreatedAtUtc")
                    VALUES (gen_random_uuid(), {name}, TRUE, FALSE, {emptyTenant}, {now})
                    ON CONFLICT ("TenantId","Name") DO NOTHING
                    """);
            }
            logger.LogInformation("Seeded default grain types.");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error seeding default grain types.");
        }
    }

    // -------------------------------------------------------------------------
    // Demo environment — one fixed tenant with user + basic farm data
    // -------------------------------------------------------------------------
    private static async Task SeedDemoAsync(
        IServiceProvider sp,
        AppDbContext context,
        ILogger logger)
    {
        try
        {
            // Skip if demo user already exists
            var userManager = sp.GetRequiredService<UserManager<AppUser>>();
            if (await userManager.FindByEmailAsync(DemoEmail) is not null)
                return;

            logger.LogInformation("Seeding demo environment for tenant {TenantId}…", DemoTenantId);

            // 1. Tenant
            if (!await context.Tenants.IgnoreQueryFilters().AnyAsync(t => t.Id == DemoTenantId))
            {
                context.Tenants.Add(new Domain.Users.Tenant
                {
                    Id = DemoTenantId,
                    Name = "Агро-Демо ТОВ"
                });
                await context.SaveChangesAsync();
            }

            // 2. Demo user
            var demoUser = new AppUser
            {
                UserName = DemoEmail,
                Email = DemoEmail,
                FirstName = "Демо",
                LastName = "Користувач",
                Role = UserRole.Administrator,
                TenantId = DemoTenantId,
                IsActive = true
            };
            var createResult = await userManager.CreateAsync(demoUser, DemoPassword);
            if (!createResult.Succeeded)
            {
                logger.LogWarning("Could not create demo user: {Errors}",
                    string.Join(", ", createResult.Errors.Select(e => e.Description)));
                return;
            }

            var now = DateTime.UtcNow;

            // 3. Warehouses
            var mainWarehouse = new Warehouse
            {
                Id = new Guid("aaaaaaaa-0000-0000-0001-000000000001"),
                Name = "Головний склад",
                Location = "с. Демо, вул. Польова, 1",
                IsActive = true,
                TenantId = DemoTenantId,
                CreatedAtUtc = now
            };
            var fuelWarehouse = new Warehouse
            {
                Id = new Guid("aaaaaaaa-0000-0000-0001-000000000002"),
                Name = "Склад ПММ",
                Location = "с. Демо, вул. Польова, 2",
                IsActive = true,
                TenantId = DemoTenantId,
                CreatedAtUtc = now
            };
            context.Warehouses.AddRange(mainWarehouse, fuelWarehouse);

            // 4. Stock items
            var seedsItem = new WarehouseItem
            {
                Id = new Guid("aaaaaaaa-0000-0000-0002-000000000001"),
                Name = "Насіння пшениці озимої",
                Code = "SEEDS-WHEAT",
                Category = "Насіння",
                BaseUnit = "кг",
                PurchasePrice = 18.50m,
                TenantId = DemoTenantId,
                CreatedAtUtc = now
            };
            var herbicide = new WarehouseItem
            {
                Id = new Guid("aaaaaaaa-0000-0000-0002-000000000002"),
                Name = "Гербіцид Раундап",
                Code = "HERB-ROUND",
                Category = "Засоби захисту рослин",
                BaseUnit = "л",
                PurchasePrice = 145.00m,
                TenantId = DemoTenantId,
                CreatedAtUtc = now
            };
            var diesel = new WarehouseItem
            {
                Id = new Guid("aaaaaaaa-0000-0000-0002-000000000003"),
                Name = "Дизельне паливо",
                Code = "FUEL-DIESEL",
                Category = "ПММ",
                BaseUnit = "л",
                PurchasePrice = 52.00m,
                TenantId = DemoTenantId,
                CreatedAtUtc = now
            };
            context.WarehouseItems.AddRange(seedsItem, herbicide, diesel);

            // 5. Initial stock moves + balances
            var seedsMove = new StockMove
            {
                WarehouseId = mainWarehouse.Id,
                ItemId = seedsItem.Id,
                MoveType = StockMoveType.Receipt,
                Quantity = 5000,
                QuantityBase = 5000,
                UnitCode = "кг",
                Note = "Початковий залишок (демо)",
                TenantId = DemoTenantId,
                CreatedAtUtc = now
            };
            var herbicideMove = new StockMove
            {
                WarehouseId = mainWarehouse.Id,
                ItemId = herbicide.Id,
                MoveType = StockMoveType.Receipt,
                Quantity = 200,
                QuantityBase = 200,
                UnitCode = "л",
                Note = "Початковий залишок (демо)",
                TenantId = DemoTenantId,
                CreatedAtUtc = now
            };
            var dieselMove = new StockMove
            {
                WarehouseId = fuelWarehouse.Id,
                ItemId = diesel.Id,
                MoveType = StockMoveType.Receipt,
                Quantity = 3000,
                QuantityBase = 3000,
                UnitCode = "л",
                Note = "Початковий залишок (демо)",
                TenantId = DemoTenantId,
                CreatedAtUtc = now
            };
            context.StockMoves.AddRange(seedsMove, herbicideMove, dieselMove);

            var seedsBalance = new StockBalance
            {
                WarehouseId = mainWarehouse.Id,
                ItemId = seedsItem.Id,
                BalanceBase = 5000,
                BaseUnit = "кг",
                LastUpdatedUtc = now,
                RowVersion = new byte[8],
                TenantId = DemoTenantId,
                CreatedAtUtc = now
            };
            var herbicideBalance = new StockBalance
            {
                WarehouseId = mainWarehouse.Id,
                ItemId = herbicide.Id,
                BalanceBase = 200,
                BaseUnit = "л",
                LastUpdatedUtc = now,
                RowVersion = new byte[8],
                TenantId = DemoTenantId,
                CreatedAtUtc = now
            };
            var dieselBalance = new StockBalance
            {
                WarehouseId = fuelWarehouse.Id,
                ItemId = diesel.Id,
                BalanceBase = 3000,
                BaseUnit = "л",
                LastUpdatedUtc = now,
                RowVersion = new byte[8],
                TenantId = DemoTenantId,
                CreatedAtUtc = now
            };
            context.StockBalances.AddRange(seedsBalance, herbicideBalance, dieselBalance);

            // 6. Fields
            var fieldWest = new Field
            {
                Id = new Guid("aaaaaaaa-0000-0000-0003-000000000001"),
                Name = "Поле Захід",
                AreaHectares = 42.5m,
                CurrentCrop = CropType.Wheat,
                CurrentCropYear = DateTime.UtcNow.Year,
                SoilType = "Чорнозем типовий",
                OwnershipType = LandOwnershipType.OwnLand,
                TenantId = DemoTenantId,
                CreatedAtUtc = now
            };
            var fieldEast = new Field
            {
                Id = new Guid("aaaaaaaa-0000-0000-0003-000000000002"),
                Name = "Поле Схід",
                AreaHectares = 38.0m,
                CurrentCrop = CropType.Sunflower,
                CurrentCropYear = DateTime.UtcNow.Year,
                SoilType = "Чорнозем вилугуваний",
                OwnershipType = LandOwnershipType.Lease,
                TenantId = DemoTenantId,
                CreatedAtUtc = now
            };
            var fieldNorth = new Field
            {
                Id = new Guid("aaaaaaaa-0000-0000-0003-000000000003"),
                Name = "Поле Північ",
                AreaHectares = 55.0m,
                CurrentCrop = CropType.Corn,
                CurrentCropYear = DateTime.UtcNow.Year,
                SoilType = "Лучно-чорноземний",
                OwnershipType = LandOwnershipType.OwnLand,
                TenantId = DemoTenantId,
                CreatedAtUtc = now
            };
            context.Fields.AddRange(fieldWest, fieldEast, fieldNorth);

            // 7. Machinery
            var tractor = new Machine
            {
                Id = new Guid("aaaaaaaa-0000-0000-0004-000000000001"),
                Name = "Трактор John Deere 8R 310",
                InventoryNumber = "TR-001",
                Type = MachineryType.Tractor,
                Brand = "John Deere",
                Model = "8R 310",
                Year = 2021,
                Status = MachineryStatus.Active,
                FuelType = FuelType.Diesel,
                FuelConsumptionPerHour = 22.5m,
                TenantId = DemoTenantId,
                CreatedAtUtc = now
            };
            var combine = new Machine
            {
                Id = new Guid("aaaaaaaa-0000-0000-0004-000000000002"),
                Name = "Комбайн Claas Lexion 770",
                InventoryNumber = "CB-001",
                Type = MachineryType.Combine,
                Brand = "Claas",
                Model = "Lexion 770",
                Year = 2020,
                Status = MachineryStatus.Active,
                FuelType = FuelType.Diesel,
                FuelConsumptionPerHour = 35.0m,
                TenantId = DemoTenantId,
                CreatedAtUtc = now
            };
            context.Machines.AddRange(tractor, combine);

            await context.SaveChangesAsync();
            logger.LogInformation(
                "Demo environment seeded. Login: {Email} / {Password}",
                DemoEmail, DemoPassword);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error seeding demo environment.");
        }
    }
}
