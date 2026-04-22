using AgroPlatform.Domain.AgroOperations;
using AgroPlatform.Domain.Authorization;
using AgroPlatform.Domain.Common;
using AgroPlatform.Domain.Economics;
using AgroPlatform.Domain.Enums;
using AgroPlatform.Domain.Fields;
using AgroPlatform.Domain.Fuel;
using AgroPlatform.Domain.GrainStorage;
using AgroPlatform.Domain.HR;
using AgroPlatform.Domain.Machinery;
using AgroPlatform.Domain.Notifications;
using AgroPlatform.Domain.Sales;
using AgroPlatform.Domain.Users;
using AgroPlatform.Domain.Warehouses;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace AgroPlatform.Infrastructure.Persistence;

public static class DataSeeder
{
    public static readonly Guid DemoTenantId = new("aaaaaaaa-0000-0000-0000-000000000001");
    public const string DemoEmail    = "demo@agro.local";
    public const string DemoPassword = "DemoPass1";

    static readonly Guid W_Main      = new("aaaaaaaa-0000-0000-0001-000000000001");
    static readonly Guid W_Fuel      = new("aaaaaaaa-0000-0000-0001-000000000002");
    static readonly Guid W_Chem      = new("aaaaaaaa-0000-0000-0001-000000000005");

    static readonly Guid I_Wheat      = new("aaaaaaaa-0000-0000-0002-000000000001");
    static readonly Guid I_Herb       = new("aaaaaaaa-0000-0000-0002-000000000002");
    static readonly Guid I_Diesel     = new("aaaaaaaa-0000-0000-0002-000000000003");
    static readonly Guid I_Fertilizer = new("aaaaaaaa-0000-0000-0002-000000000004");
    static readonly Guid I_Seeds_Sun  = new("aaaaaaaa-0000-0000-0002-000000000005");
    static readonly Guid I_Seeds_Corn = new("aaaaaaaa-0000-0000-0002-000000000006");
    static readonly Guid I_Fungicide  = new("aaaaaaaa-0000-0000-0002-000000000007");

    static readonly Guid F1 = new("aaaaaaaa-0000-0000-0003-000000000001");
    static readonly Guid F2 = new("aaaaaaaa-0000-0000-0003-000000000002");
    static readonly Guid F3 = new("aaaaaaaa-0000-0000-0003-000000000003");
    static readonly Guid F4 = new("aaaaaaaa-0000-0000-0003-000000000004");
    static readonly Guid F5 = new("aaaaaaaa-0000-0000-0003-000000000005");
    static readonly Guid F6 = new("aaaaaaaa-0000-0000-0003-000000000006");
    static readonly Guid F7 = new("aaaaaaaa-0000-0000-0003-000000000007");

    static readonly Guid M_Tractor1 = new("aaaaaaaa-0000-0000-0004-000000000001");
    static readonly Guid M_Combine  = new("aaaaaaaa-0000-0000-0004-000000000002");
    static readonly Guid M_Sprayer  = new("aaaaaaaa-0000-0000-0004-000000000003");
    static readonly Guid M_Seeder   = new("aaaaaaaa-0000-0000-0004-000000000004");
    static readonly Guid M_Truck    = new("aaaaaaaa-0000-0000-0004-000000000005");

    static readonly Guid Op_Harvest1 = new("aaaaaaaa-0000-0000-0005-000000000001");
    static readonly Guid Op_Harvest2 = new("aaaaaaaa-0000-0000-0005-000000000002");
    static readonly Guid Op_Harvest3 = new("aaaaaaaa-0000-0000-0005-000000000003");
    static readonly Guid Op_Seeding1 = new("aaaaaaaa-0000-0000-0005-000000000004");
    static readonly Guid Op_Seeding2 = new("aaaaaaaa-0000-0000-0005-000000000005");
    static readonly Guid Op_Protect1 = new("aaaaaaaa-0000-0000-0005-000000000006");
    static readonly Guid Op_Fertil1  = new("aaaaaaaa-0000-0000-0005-000000000007");

    static readonly Guid GB_Wheat = new("aaaaaaaa-0000-0000-0006-000000000001");
    static readonly Guid GB_Sun   = new("aaaaaaaa-0000-0000-0006-000000000002");
    static readonly Guid GB_Corn  = new("aaaaaaaa-0000-0000-0006-000000000003");

    // Proper GrainStorage entity IDs (separate from Warehouse IDs)
    static readonly Guid GS_West = new("aaaaaaaa-0000-0000-0009-000000000001");
    static readonly Guid GS_East = new("aaaaaaaa-0000-0000-0009-000000000002");

    static readonly Guid Emp1 = new("aaaaaaaa-0000-0000-0007-000000000001");
    static readonly Guid Emp2 = new("aaaaaaaa-0000-0000-0007-000000000002");
    static readonly Guid Emp3 = new("aaaaaaaa-0000-0000-0007-000000000003");
    static readonly Guid Emp4 = new("aaaaaaaa-0000-0000-0007-000000000004");

    static readonly Guid FT_Diesel = new("aaaaaaaa-0000-0000-0008-000000000001");
    static readonly Guid FT_Gas    = new("aaaaaaaa-0000-0000-0008-000000000002");

    public static readonly string[] DefaultGrainTypes =
    [
        "Пшениця озима", "Пшениця яра", "Ячмінь", "Кукурудза",
        "Соняшник", "Соя", "Ріпак", "Горох", "Жито", "Овес"
    ];

    public static async Task SeedAsync(IServiceProvider services, IConfiguration configuration)
    {
        using var scope  = services.CreateScope();
        var context      = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var logger       = scope.ServiceProvider.GetRequiredService<ILogger<AppDbContext>>();
        await SeedGrainTypesAsync(context, logger);
        await SeedRolePermissionsAsync(context, logger);
        await SeedItemCategoriesAsync(context, logger);
        await SeedSuperAdminAsync(scope.ServiceProvider, configuration, logger);
        await SeedDemoAsync(scope.ServiceProvider, context, logger);

        // Optionally extend the demo tenant to investor-demo scale (80 fields, 25 machines,
        // 12 months of costs, 8 months of sales, 4 seasons of harvests). Gated on Demo:Scale.
        try
        {
            await DataSeederInvestor.ExtendAsync(context, configuration, logger);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error applying investor-scale demo seed (non-fatal).");
        }
    }

    private static async Task SeedSuperAdminAsync(IServiceProvider sp, IConfiguration configuration, ILogger logger)
    {
        try
        {
            var email    = configuration["SuperAdmin:Email"];
            var password = configuration["SuperAdmin:Password"];

            if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
            {
                logger.LogWarning("SuperAdmin credentials not configured. Skipping SuperAdmin seed.");
                return;
            }

            var userManager = sp.GetRequiredService<UserManager<AppUser>>();

            var existing = await userManager.FindByEmailAsync(email);
            if (existing is not null)
            {
                // Ensure SuperAdmin can always log in with configured password
                if (!await userManager.CheckPasswordAsync(existing, password))
                {
                    var token = await userManager.GeneratePasswordResetTokenAsync(existing);
                    var resetResult = await userManager.ResetPasswordAsync(existing, token, password);
                    if (resetResult.Succeeded)
                        logger.LogInformation("SuperAdmin password reset to match configuration.");
                    else
                        logger.LogWarning("Could not reset SuperAdmin password: {Errors}",
                            string.Join(", ", resetResult.Errors.Select(e => e.Description)));
                }

                // Ensure SuperAdmin is always active
                if (!existing.IsActive)
                {
                    existing.IsActive = true;
                    await userManager.UpdateAsync(existing);
                    logger.LogInformation("SuperAdmin re-activated.");
                }

                return;
            }

            logger.LogInformation("Seeding SuperAdmin user: {Email}", email);

            var superAdmin = new AppUser
            {
                UserName              = email,
                Email                 = email,
                FirstName             = "Super",
                LastName              = "Admin",
                Role                  = UserRole.SuperAdmin,
                TenantId              = Guid.Empty,
                IsActive              = true,
                RequirePasswordChange = false,
            };

            var result = await userManager.CreateAsync(superAdmin, password);
            if (!result.Succeeded)
                logger.LogWarning("Could not create SuperAdmin: {Errors}",
                    string.Join(", ", result.Errors.Select(e => e.Description)));
            else
                logger.LogInformation("SuperAdmin seeded successfully.");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error seeding SuperAdmin.");
        }
    }

    private static async Task SeedGrainTypesAsync(AppDbContext context, ILogger logger)
    {
        try
        {
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

    private static async Task SeedRolePermissionsAsync(AppDbContext context, ILogger logger)
    {
        try
        {
            // Belt-and-suspenders: migration InsertData runs the primary seed.
            // This only fires if the table is empty (e.g., manual-migration environments).
            if (await context.RolePermissions.AnyAsync())
                return;

            logger.LogInformation("Seeding default role permissions…");

            var allView = new[]
            {
                "Warehouses.View", "Inventory.View", "Analytics.View", "Machinery.View", "Fields.View",
                "Economics.View", "HR.View", "GrainStorage.View", "Fuel.View", "Sales.View"
            };

            var allManage = new[]
            {
                "Warehouses.Manage", "Inventory.Manage", "Machinery.Manage", "Fields.Manage",
                "Economics.Manage", "HR.Manage", "GrainStorage.Manage", "Fuel.Manage",
                "Sales.Manage", "Admin.Manage"
            };

            var grants = new List<(string Role, string Policy)>();

            var allRoles = new[] { "SuperAdmin", "CompanyAdmin", "Manager", "WarehouseOperator", "Accountant", "Viewer" };
            foreach (var role in allRoles)
                foreach (var policy in allView)
                    grants.Add((role, policy));

            foreach (var policy in allManage)
            {
                grants.Add(("SuperAdmin",    policy));
                grants.Add(("CompanyAdmin",  policy));
            }

            foreach (var policy in allManage.Where(p => p != "Admin.Manage"))
                grants.Add(("Manager", policy));

            foreach (var policy in new[] { "Warehouses.Manage", "Inventory.Manage", "GrainStorage.Manage", "Fuel.Manage" })
                grants.Add(("WarehouseOperator", policy));

            foreach (var policy in new[] { "Economics.Manage", "Sales.Manage", "HR.Manage" })
                grants.Add(("Accountant", policy));

            // Viewer: View grants only (already added above)

            context.RolePermissions.AddRange(grants.Select(g =>
                new RolePermission
                {
                    RoleName   = g.Role,
                    PolicyName = g.Policy,
                    IsGranted  = true
                }));

            await context.SaveChangesAsync();
            logger.LogInformation("Seeded {Count} role permission grants.", grants.Count);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error seeding role permissions.");
        }
    }

    private static async Task SeedItemCategoriesAsync(AppDbContext context, ILogger logger)
    {
        try
        {
            if (await context.ItemCategories.IgnoreQueryFilters().AnyAsync())
                return;

            logger.LogInformation("Seeding default item categories…");

            var now = DateTime.UtcNow;
            var categories = new[]
            {
                new Domain.Warehouses.ItemCategory { Name = "Насіння",  Code = "Seeds",       TenantId = DemoTenantId, CreatedAtUtc = now },
                new Domain.Warehouses.ItemCategory { Name = "Добрива",  Code = "Fertilizers", TenantId = DemoTenantId, CreatedAtUtc = now },
                new Domain.Warehouses.ItemCategory { Name = "ЗЗР",      Code = "Pesticides",  TenantId = DemoTenantId, CreatedAtUtc = now },
                new Domain.Warehouses.ItemCategory { Name = "ПММ",      Code = "Fuel",        TenantId = DemoTenantId, CreatedAtUtc = now },
                new Domain.Warehouses.ItemCategory { Name = "Запчастини", Code = "SpareParts", TenantId = DemoTenantId, CreatedAtUtc = now },
                new Domain.Warehouses.ItemCategory { Name = "Хімікати", Code = "Chemicals",   TenantId = DemoTenantId, CreatedAtUtc = now },
                new Domain.Warehouses.ItemCategory { Name = "Інше",     Code = "Other",       TenantId = DemoTenantId, CreatedAtUtc = now },
            };

            context.ItemCategories.AddRange(categories);
            await context.SaveChangesAsync();
            logger.LogInformation("Seeded {Count} item categories.", categories.Length);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error seeding item categories.");
        }
    }

    private static async Task SeedDemoAsync(IServiceProvider sp, AppDbContext context, ILogger logger)
    {
        try
        {
            var userManager = sp.GetRequiredService<UserManager<AppUser>>();
            if (await userManager.FindByEmailAsync(DemoEmail) is not null)
                return;

            logger.LogInformation("Seeding full demo environment…");

            var now  = DateTime.UtcNow;
            var year = now.Year;
            DateTime D(int daysAgo) => now.AddDays(-daysAgo);

            // 1. Tenant
            if (!await context.Tenants.IgnoreQueryFilters().AnyAsync(t => t.Id == DemoTenantId))
            {
                context.Tenants.Add(new Tenant { Id = DemoTenantId, Name = "Агро-Демо ТОВ" });
                await context.SaveChangesAsync();
            }

            // 2. Users
            var demoUser = new AppUser
            {
                UserName = DemoEmail, Email = DemoEmail,
                FirstName = "Олексій", LastName = "Коваленко",
                Role = UserRole.CompanyAdmin, TenantId = DemoTenantId, IsActive = true,
                RequirePasswordChange = false
            };
            var createResult = await userManager.CreateAsync(demoUser, DemoPassword);
            if (!createResult.Succeeded)
            {
                logger.LogWarning("Could not create demo user: {Errors}",
                    string.Join(", ", createResult.Errors.Select(e => e.Description)));
                return;
            }

            await userManager.CreateAsync(new AppUser
            {
                UserName = "agro@agro.local", Email = "agro@agro.local",
                FirstName = "Ірина", LastName = "Мельник",
                Role = UserRole.Manager, TenantId = DemoTenantId, IsActive = true,
                RequirePasswordChange = false
            }, "AgroPass1");

            await userManager.CreateAsync(new AppUser
            {
                UserName = "manager@agro.local", Email = "manager@agro.local",
                FirstName = "Василь", LastName = "Сидоренко",
                Role = UserRole.Manager, TenantId = DemoTenantId, IsActive = true,
                RequirePasswordChange = false
            }, "ManagerPass1");

            // 3. Warehouses (materials only — Type=0)
            context.Warehouses.AddRange(
                new Warehouse { Id = W_Main,  Name = "Головний склад МТС",      Location = "с. Демо, вул. Польова, 1",  IsActive = true, Type = 0, TenantId = DemoTenantId, CreatedAtUtc = now },
                new Warehouse { Id = W_Fuel,  Name = "Паливно-мастильний склад", Location = "с. Демо, вул. Польова, 2",  IsActive = true, Type = 0, TenantId = DemoTenantId, CreatedAtUtc = now },
                new Warehouse { Id = W_Chem,  Name = "Агрохімічний склад",      Location = "с. Демо, вул. Садова, 5",   IsActive = true, Type = 0, TenantId = DemoTenantId, CreatedAtUtc = now }
            );

            // 3b. Grain storage facilities (dedicated grain entities)
            context.GrainStorages.AddRange(
                new Domain.GrainStorage.GrainStorage { Id = GS_West, Name = "Зерносховище Захід", Code = "GS-W01", Location = "с. Демо, поле №1", StorageType = "Flat",     CapacityTons = 500.0m, IsActive = true, TenantId = DemoTenantId, CreatedAtUtc = now },
                new Domain.GrainStorage.GrainStorage { Id = GS_East, Name = "Зерносховище Схід",  Code = "GS-E01", Location = "с. Демо, поле №2", StorageType = "Elevator", CapacityTons = 800.0m, IsActive = true, TenantId = DemoTenantId, CreatedAtUtc = now }
            );

            // 4. Warehouse items
            context.WarehouseItems.AddRange(
                new WarehouseItem { Id = I_Wheat,      Name = "Насіння пшениці озимої", Code = "SEEDS-WHEAT", Category = "Насіння",               BaseUnit = "кг", PurchasePrice = 18.50m,  TenantId = DemoTenantId, CreatedAtUtc = now },
                new WarehouseItem { Id = I_Herb,       Name = "Гербіцид Раундап",       Code = "HERB-ROUND",  Category = "ЗЗР",                   BaseUnit = "л",  PurchasePrice = 145.00m, TenantId = DemoTenantId, CreatedAtUtc = now },
                new WarehouseItem { Id = I_Diesel,     Name = "Дизельне паливо",         Code = "FUEL-DIESEL", Category = "ПММ",                   BaseUnit = "л",  PurchasePrice = 52.00m,  TenantId = DemoTenantId, CreatedAtUtc = now },
                new WarehouseItem { Id = I_Fertilizer, Name = "Аміачна селітра",         Code = "FERT-AN",     Category = "Добрива",               BaseUnit = "кг", PurchasePrice = 22.50m,  TenantId = DemoTenantId, CreatedAtUtc = now },
                new WarehouseItem { Id = I_Seeds_Sun,  Name = "Насіння соняшника",       Code = "SEEDS-SUN",   Category = "Насіння",               BaseUnit = "кг", PurchasePrice = 85.00m,  TenantId = DemoTenantId, CreatedAtUtc = now },
                new WarehouseItem { Id = I_Seeds_Corn, Name = "Насіння кукурудзи",       Code = "SEEDS-CORN",  Category = "Насіння",               BaseUnit = "кг", PurchasePrice = 72.00m,  TenantId = DemoTenantId, CreatedAtUtc = now },
                new WarehouseItem { Id = I_Fungicide,  Name = "Фунгіцид Фалькон",        Code = "FUNG-FAL",    Category = "ЗЗР",                   BaseUnit = "л",  PurchasePrice = 215.00m, TenantId = DemoTenantId, CreatedAtUtc = now }
            );

            // 5. Stock moves + balances
            context.StockMoves.AddRange(
                Mv(W_Main,  I_Wheat,       StockMoveType.Receipt,       8000, "кг",  "Закупка насіння пшениці"),
                Mv(W_Main,  I_Wheat,       StockMoveType.Issue,         3500, "кг",  "Витрата на сівбу поле Захід-1"),
                Mv(W_Main,  I_Seeds_Sun,   StockMoveType.Receipt,       1200, "кг",  "Закупка насіння соняшника"),
                Mv(W_Main,  I_Seeds_Corn,  StockMoveType.Receipt,       2000, "кг",  "Закупка насіння кукурудзи"),
                Mv(W_Chem,  I_Herb,        StockMoveType.Receipt,        500, "л",   "Закупка гербіциду"),
                Mv(W_Chem,  I_Herb,        StockMoveType.Issue,          180, "л",   "Обробка полів"),
                Mv(W_Chem,  I_Fertilizer,  StockMoveType.Receipt,      25000, "кг",  "Закупка аміачної селітри"),
                Mv(W_Chem,  I_Fertilizer,  StockMoveType.Issue,         8000, "кг",  "Удобрення полів"),
                Mv(W_Chem,  I_Fungicide,   StockMoveType.Receipt,        300, "л",   "Закупка фунгіциду"),
                Mv(W_Fuel,  I_Diesel,      StockMoveType.Receipt,      15000, "л",   "Заправка цистерни"),
                Mv(W_Fuel,  I_Diesel,      StockMoveType.Issue,         4200, "л",   "Видача техніці")
            );
            context.StockBalances.AddRange(
                Bal(W_Main,  I_Wheat,      4500,  "кг", now),
                Bal(W_Main,  I_Seeds_Sun,  1200,  "кг", now),
                Bal(W_Main,  I_Seeds_Corn, 2000,  "кг", now),
                Bal(W_Chem,  I_Herb,        320,  "л",  now),
                Bal(W_Chem,  I_Fertilizer, 17000, "кг", now),
                Bal(W_Chem,  I_Fungicide,   300,  "л",  now),
                Bal(W_Fuel,  I_Diesel,     10800, "л",  now)
            );

            // 6. Fields
            context.Fields.AddRange(
                new Field { Id = F1, Name = "Захід-1",  AreaHectares = 42.5m, CurrentCrop = CropType.Wheat,     CurrentCropYear = year, SoilType = "Чорнозем типовий",     OwnershipType = LandOwnershipType.OwnLand,    TenantId = DemoTenantId, CreatedAtUtc = now },
                new Field { Id = F2, Name = "Схід-2",   AreaHectares = 38.0m, CurrentCrop = CropType.Sunflower, CurrentCropYear = year, SoilType = "Чорнозем вилугуваний", OwnershipType = LandOwnershipType.Lease,      TenantId = DemoTenantId, CreatedAtUtc = now },
                new Field { Id = F3, Name = "Північ-3",  AreaHectares = 55.0m, CurrentCrop = CropType.Corn,      CurrentCropYear = year, SoilType = "Лучно-чорноземний",    OwnershipType = LandOwnershipType.OwnLand,    TenantId = DemoTenantId, CreatedAtUtc = now },
                new Field { Id = F4, Name = "Степ-4",   AreaHectares = 65.0m, CurrentCrop = CropType.Barley,    CurrentCropYear = year, SoilType = "Темно-каштановий",     OwnershipType = LandOwnershipType.ShareLease, TenantId = DemoTenantId, CreatedAtUtc = now },
                new Field { Id = F5, Name = "Балка-5",  AreaHectares = 48.0m, CurrentCrop = CropType.Rapeseed,  CurrentCropYear = year, SoilType = "Чорнозем звичайний",   OwnershipType = LandOwnershipType.Lease,      TenantId = DemoTenantId, CreatedAtUtc = now },
                new Field { Id = F6, Name = "Луг-6",    AreaHectares = 72.0m, CurrentCrop = CropType.Soybean,   CurrentCropYear = year, SoilType = "Лучно-чорноземний",    OwnershipType = LandOwnershipType.OwnLand,    TenantId = DemoTenantId, CreatedAtUtc = now },
                new Field { Id = F7, Name = "Пар-7",    AreaHectares = 30.0m, CurrentCrop = CropType.Fallow,    CurrentCropYear = year, SoilType = "Чорнозем типовий",     OwnershipType = LandOwnershipType.OwnLand,    TenantId = DemoTenantId, CreatedAtUtc = now }
            );

            // 7. Field seedings
            context.FieldSeedings.AddRange(
                new FieldSeeding { FieldId = F1, Year = year, CropName = "Пшениця озима",  Variety = "Подолянка",    SeedingRateKgPerHa = 220, TotalSeedKg = 9350,  SeedingDate = D(210), TenantId = DemoTenantId, CreatedAtUtc = now },
                new FieldSeeding { FieldId = F2, Year = year, CropName = "Соняшник",        Variety = "НК Роккі",     SeedingRateKgPerHa = 5,   TotalSeedKg = 190,   SeedingDate = D(80),  TenantId = DemoTenantId, CreatedAtUtc = now },
                new FieldSeeding { FieldId = F3, Year = year, CropName = "Кукурудза",       Variety = "Аргентум",     SeedingRateKgPerHa = 25,  TotalSeedKg = 1375,  SeedingDate = D(75),  TenantId = DemoTenantId, CreatedAtUtc = now },
                new FieldSeeding { FieldId = F4, Year = year, CropName = "Ячмінь ярий",    Variety = "Командор",     SeedingRateKgPerHa = 180, TotalSeedKg = 11700, SeedingDate = D(90),  TenantId = DemoTenantId, CreatedAtUtc = now },
                new FieldSeeding { FieldId = F5, Year = year, CropName = "Ріпак озимий",   Variety = "Аберус",       SeedingRateKgPerHa = 4,   TotalSeedKg = 192,   SeedingDate = D(200), TenantId = DemoTenantId, CreatedAtUtc = now },
                new FieldSeeding { FieldId = F6, Year = year, CropName = "Соя",             Variety = "Рімус",        SeedingRateKgPerHa = 90,  TotalSeedKg = 6480,  SeedingDate = D(70),  TenantId = DemoTenantId, CreatedAtUtc = now }
            );

            // 8. Field fertilizers
            context.FieldFertilizers.AddRange(
                new FieldFertilizer { FieldId = F1, Year = year, FertilizerName = "Аміачна селітра", ApplicationType = "Підживлення", RateKgPerHa = 150, TotalKg = 6375,  CostPerKg = 22.5m, TotalCost = 143437.5m, ApplicationDate = D(180), TenantId = DemoTenantId, CreatedAtUtc = now },
                new FieldFertilizer { FieldId = F3, Year = year, FertilizerName = "КАС-32",          ApplicationType = "Листове",     RateKgPerHa = 90,  TotalKg = 4950,  CostPerKg = 18.0m, TotalCost = 89100.0m,  ApplicationDate = D(50),  TenantId = DemoTenantId, CreatedAtUtc = now },
                new FieldFertilizer { FieldId = F4, Year = year, FertilizerName = "Нітроамофоска",   ApplicationType = "Основне",     RateKgPerHa = 200, TotalKg = 13000, CostPerKg = 25.0m, TotalCost = 325000.0m, ApplicationDate = D(95),  TenantId = DemoTenantId, CreatedAtUtc = now }
            );

            // 9. Field protection
            context.FieldProtections.AddRange(
                new FieldProtection { FieldId = F1, Year = year, ProductName = "Гербіцид Раундап", ProtectionType = "Гербіцид",   RateLPerHa = 2.0m, TotalLiters = 85.0m,  CostPerLiter = 145.0m, TotalCost = 12325.0m, ApplicationDate = D(160), TenantId = DemoTenantId, CreatedAtUtc = now },
                new FieldProtection { FieldId = F2, Year = year, ProductName = "Фунгіцид Фалькон", ProtectionType = "Фунгіцид",   RateLPerHa = 0.6m, TotalLiters = 22.8m,  CostPerLiter = 215.0m, TotalCost = 4902.0m,  ApplicationDate = D(40),  TenantId = DemoTenantId, CreatedAtUtc = now },
                new FieldProtection { FieldId = F5, Year = year, ProductName = "Інсектицид Децис", ProtectionType = "Інсектицид", RateLPerHa = 0.5m, TotalLiters = 24.0m,  CostPerLiter = 180.0m, TotalCost = 4320.0m,  ApplicationDate = D(55),  TenantId = DemoTenantId, CreatedAtUtc = now }
            );

            // 10. Harvest records
            context.FieldHarvests.AddRange(
                new FieldHarvest { FieldId = F1, Year = year - 1, CropName = "Пшениця озима", TotalTons = 255.0m,  YieldTonsPerHa = 6.0m,  MoisturePercent = 13.5m, PricePerTon = 7200.0m,  TotalRevenue = 1836000.0m, HarvestDate = new DateTime(year - 1, 7, 20, 0, 0, 0, DateTimeKind.Utc), TenantId = DemoTenantId, CreatedAtUtc = now },
                new FieldHarvest { FieldId = F2, Year = year - 1, CropName = "Соняшник",      TotalTons = 106.4m,  YieldTonsPerHa = 2.8m,  MoisturePercent = 8.0m,  PricePerTon = 18500.0m, TotalRevenue = 1968400.0m, HarvestDate = new DateTime(year - 1, 9, 10, 0, 0, 0, DateTimeKind.Utc), TenantId = DemoTenantId, CreatedAtUtc = now },
                new FieldHarvest { FieldId = F3, Year = year - 1, CropName = "Кукурудза",     TotalTons = 440.0m,  YieldTonsPerHa = 8.0m,  MoisturePercent = 14.0m, PricePerTon = 5800.0m,  TotalRevenue = 2552000.0m, HarvestDate = new DateTime(year - 1, 10, 5, 0, 0, 0, DateTimeKind.Utc), TenantId = DemoTenantId, CreatedAtUtc = now },
                new FieldHarvest { FieldId = F4, Year = year - 1, CropName = "Ячмінь ярий",  TotalTons = 338.0m,  YieldTonsPerHa = 5.2m,  MoisturePercent = 12.5m, PricePerTon = 5500.0m,  TotalRevenue = 1859000.0m, HarvestDate = new DateTime(year - 1, 7, 10, 0, 0, 0, DateTimeKind.Utc), TenantId = DemoTenantId, CreatedAtUtc = now },
                new FieldHarvest { FieldId = F6, Year = year - 1, CropName = "Соя",           TotalTons = 194.4m,  YieldTonsPerHa = 2.7m,  MoisturePercent = 12.0m, PricePerTon = 14000.0m, TotalRevenue = 2721600.0m, HarvestDate = new DateTime(year - 1, 10, 1, 0, 0, 0, DateTimeKind.Utc), TenantId = DemoTenantId, CreatedAtUtc = now }
            );

            // 11. Machinery
            context.Machines.AddRange(
                new Machine { Id = M_Tractor1, Name = "Трактор John Deere 8R 310",    InventoryNumber = "TR-001", Type = MachineryType.Tractor,  Brand = "John Deere", Model = "8R 310",      Year = 2021, Status = MachineryStatus.Active,      FuelType = FuelType.Diesel, FuelConsumptionPerHour = 22.5m, TenantId = DemoTenantId, CreatedAtUtc = now },
                new Machine { Id = M_Combine,  Name = "Комбайн Claas Lexion 770",     InventoryNumber = "CB-001", Type = MachineryType.Combine,  Brand = "Claas",      Model = "Lexion 770",  Year = 2020, Status = MachineryStatus.Active,      FuelType = FuelType.Diesel, FuelConsumptionPerHour = 35.0m, TenantId = DemoTenantId, CreatedAtUtc = now },
                new Machine { Id = M_Sprayer,  Name = "Обприскувач Amazone UX 5200", InventoryNumber = "SP-001", Type = MachineryType.Sprayer,  Brand = "Amazone",    Model = "UX 5200",     Year = 2019, Status = MachineryStatus.Active,      FuelType = FuelType.Diesel, FuelConsumptionPerHour = 8.0m,  TenantId = DemoTenantId, CreatedAtUtc = now },
                new Machine { Id = M_Seeder,   Name = "Сівалка Horsch Pronto 9 DC",  InventoryNumber = "SD-001", Type = MachineryType.Seeder,   Brand = "Horsch",     Model = "Pronto 9 DC", Year = 2022, Status = MachineryStatus.Active,      FuelType = FuelType.Diesel, FuelConsumptionPerHour = 12.0m, TenantId = DemoTenantId, CreatedAtUtc = now },
                new Machine { Id = M_Truck,    Name = "КамАЗ 45143 (зерновоз)",       InventoryNumber = "TK-001", Type = MachineryType.Truck,    Brand = "КамАЗ",      Model = "45143",        Year = 2018, Status = MachineryStatus.UnderRepair, FuelType = FuelType.Diesel, FuelConsumptionPerHour = 18.0m, TenantId = DemoTenantId, CreatedAtUtc = now }
            );

            // 12. Maintenance records
            context.MaintenanceRecords.AddRange(
                new MaintenanceRecord { MachineId = M_Tractor1, Date = D(30),  Type = "Scheduled",  Description = "ТО-500 — заміна масла, фільтрів",         Cost = 12500.0m, HoursAtMaintenance = 1240, TenantId = DemoTenantId, CreatedAtUtc = now },
                new MaintenanceRecord { MachineId = M_Combine,  Date = D(180), Type = "Scheduled",  Description = "Підготовка до жнив, заміна ремнів",       Cost = 35000.0m, HoursAtMaintenance = 870,  TenantId = DemoTenantId, CreatedAtUtc = now },
                new MaintenanceRecord { MachineId = M_Truck,    Date = D(10),  Type = "Repair",     Description = "Ремонт ПНВТ, заміна форсунок",            Cost = 28000.0m, HoursAtMaintenance = 3200, TenantId = DemoTenantId, CreatedAtUtc = now },
                new MaintenanceRecord { MachineId = M_Sprayer,  Date = D(60),  Type = "Inspection", Description = "Перевірка форсунок, налаштування штанги", Cost = 3200.0m,  HoursAtMaintenance = 420,  TenantId = DemoTenantId, CreatedAtUtc = now }
            );

            // 13. Fuel tanks + transactions
            context.FuelTanks.AddRange(
                new FuelTank { Id = FT_Diesel, Name = "Основна цистерна (дизель)", FuelType = FuelType.Diesel,   CapacityLiters = 20000, CurrentLiters = 10800, PricePerLiter = 52.0m,  IsActive = true, TenantId = DemoTenantId, CreatedAtUtc = now },
                new FuelTank { Id = FT_Gas,    Name = "Бензосховище",              FuelType = FuelType.Gasoline, CapacityLiters = 3000,  CurrentLiters = 850,   PricePerLiter = 58.0m,  IsActive = true, TenantId = DemoTenantId, CreatedAtUtc = now }
            );
            context.FuelTransactions.AddRange(
                new FuelTransaction { FuelTankId = FT_Diesel, TransactionType = "Receipt",   QuantityLiters = 15000, PricePerLiter = 52.0m, TotalCost = 780000.0m, TransactionDate = D(60), SupplierName = "Атлант-Нафта",  InvoiceNumber = "АН-2024-0041", TenantId = DemoTenantId, CreatedAtUtc = now },
                new FuelTransaction { FuelTankId = FT_Diesel, TransactionType = "Dispensed", QuantityLiters = 2500,  PricePerLiter = 52.0m, TotalCost = 130000.0m, TransactionDate = D(45), MachineId = M_Tractor1, DriverName = "Петро Харченко", TenantId = DemoTenantId, CreatedAtUtc = now },
                new FuelTransaction { FuelTankId = FT_Diesel, TransactionType = "Dispensed", QuantityLiters = 1200,  PricePerLiter = 52.0m, TotalCost = 62400.0m,  TransactionDate = D(20), MachineId = M_Combine,  DriverName = "Іван Бойко",     TenantId = DemoTenantId, CreatedAtUtc = now },
                new FuelTransaction { FuelTankId = FT_Diesel, TransactionType = "Dispensed", QuantityLiters = 500,   PricePerLiter = 52.0m, TotalCost = 26000.0m,  TransactionDate = D(5),  MachineId = M_Sprayer,  DriverName = "Микола Кравець", TenantId = DemoTenantId, CreatedAtUtc = now }
            );

            // 14. Machine work logs
            context.MachineWorkLogs.AddRange(
                new MachineWorkLog { MachineId = M_Tractor1, Date = D(45), HoursWorked = 12.5m, AgroOperationId = Op_Seeding1, Description = "Сівба Захід-1",       TenantId = DemoTenantId, CreatedAtUtc = now },
                new MachineWorkLog { MachineId = M_Tractor1, Date = D(44), HoursWorked = 10.0m, AgroOperationId = Op_Seeding2, Description = "Сівба Північ-3",      TenantId = DemoTenantId, CreatedAtUtc = now },
                new MachineWorkLog { MachineId = M_Combine,  Date = D(20), HoursWorked = 14.0m, AgroOperationId = Op_Harvest1, Description = "Збирання Захід-1",    TenantId = DemoTenantId, CreatedAtUtc = now },
                new MachineWorkLog { MachineId = M_Sprayer,  Date = D(55), HoursWorked = 8.0m,  AgroOperationId = Op_Protect1, Description = "Захист соняшника",    TenantId = DemoTenantId, CreatedAtUtc = now }
            );

            // 15. Agro operations
            context.AgroOperations.AddRange(
                new AgroOperation { Id = Op_Harvest1, FieldId = F1, OperationType = AgroOperationType.Harvesting,      PlannedDate = D(25), CompletedDate = D(20), Status = OperationStatus.Completed,  AreaProcessed = 42.5m, Description = "Збирання пшениці Захід-1",        TenantId = DemoTenantId, CreatedAtUtc = now },
                new AgroOperation { Id = Op_Harvest2, FieldId = F4, OperationType = AgroOperationType.Harvesting,      PlannedDate = D(20), CompletedDate = D(15), Status = OperationStatus.Completed,  AreaProcessed = 65.0m, Description = "Збирання ячменю Степ-4",           TenantId = DemoTenantId, CreatedAtUtc = now },
                new AgroOperation { Id = Op_Harvest3, FieldId = F2, OperationType = AgroOperationType.Harvesting,      PlannedDate = D(5),  CompletedDate = null,  Status = OperationStatus.InProgress, AreaProcessed = null,  Description = "Збирання соняшника Схід-2 (в процесі)", TenantId = DemoTenantId, CreatedAtUtc = now },
                new AgroOperation { Id = Op_Seeding1, FieldId = F1, OperationType = AgroOperationType.Sowing,          PlannedDate = D(50), CompletedDate = D(45), Status = OperationStatus.Completed,  AreaProcessed = 42.5m, Description = "Сівба пшениці озимої",              TenantId = DemoTenantId, CreatedAtUtc = now },
                new AgroOperation { Id = Op_Seeding2, FieldId = F3, OperationType = AgroOperationType.Sowing,          PlannedDate = D(80), CompletedDate = D(75), Status = OperationStatus.Completed,  AreaProcessed = 55.0m, Description = "Сівба кукурудзи",                    TenantId = DemoTenantId, CreatedAtUtc = now },
                new AgroOperation { Id = Op_Protect1, FieldId = F2, OperationType = AgroOperationType.PlantProtection, PlannedDate = D(45), CompletedDate = D(40), Status = OperationStatus.Completed,  AreaProcessed = 38.0m, Description = "Обробка соняшника фунгіцидом",       TenantId = DemoTenantId, CreatedAtUtc = now },
                new AgroOperation { Id = Op_Fertil1,  FieldId = F3, OperationType = AgroOperationType.Fertilizing,     PlannedDate = D(55), CompletedDate = D(50), Status = OperationStatus.Completed,  AreaProcessed = 55.0m, Description = "Підживлення кукурудзи КАС-32",       TenantId = DemoTenantId, CreatedAtUtc = now }
            );
            context.AgroOperationMachineries.AddRange(
                new AgroOperationMachinery { AgroOperationId = Op_Harvest1, MachineId = M_Combine,  HoursWorked = 14.0m, FuelUsed = 490.0m, OperatorName = "Іван Бойко",     TenantId = DemoTenantId, CreatedAtUtc = now },
                new AgroOperationMachinery { AgroOperationId = Op_Harvest2, MachineId = M_Combine,  HoursWorked = 18.0m, FuelUsed = 630.0m, OperatorName = "Іван Бойко",     TenantId = DemoTenantId, CreatedAtUtc = now },
                new AgroOperationMachinery { AgroOperationId = Op_Seeding1, MachineId = M_Tractor1, HoursWorked = 12.5m, FuelUsed = 281.0m, OperatorName = "Петро Харченко", TenantId = DemoTenantId, CreatedAtUtc = now },
                new AgroOperationMachinery { AgroOperationId = Op_Protect1, MachineId = M_Sprayer,  HoursWorked = 8.0m,  FuelUsed = 64.0m,  OperatorName = "Микола Кравець", TenantId = DemoTenantId, CreatedAtUtc = now }
            );

            // 16. Grain storage batches
            context.GrainBatches.AddRange(
                new GrainBatch { Id = GB_Wheat, GrainType = "Пшениця озима", QuantityTons = 180.0m, InitialQuantityTons = 255.0m, OwnershipType = GrainOwnershipType.Own, ReceivedDate = D(20), SourceFieldId = F1, MoisturePercent = 13.5m, ImpurityPercent = 1.2m, GrainImpurityPercent = 1.8m, ProteinPercent = 12.5m, GlutenPercent = 23.0m, NaturePerLiter = 760, QualityClass = 3, PricePerTon = 7200.0m,  Notes = "Урожай поточного сезону", TenantId = DemoTenantId, CreatedAtUtc = now },
                new GrainBatch { Id = GB_Sun,   GrainType = "Соняшник",      QuantityTons = 106.4m, InitialQuantityTons = 106.4m, OwnershipType = GrainOwnershipType.Own, ReceivedDate = D(5),  SourceFieldId = F2, MoisturePercent = 7.8m,  ImpurityPercent = 1.5m, GrainImpurityPercent = 2.0m, ProteinPercent = 18.5m,                     NaturePerLiter = null, QualityClass = 2, PricePerTon = 18500.0m, Notes = "Збирання в процесі",       TenantId = DemoTenantId, CreatedAtUtc = now },
                new GrainBatch { Id = GB_Corn,  GrainType = "Кукурудза",     QuantityTons = 250.0m, InitialQuantityTons = 440.0m, OwnershipType = GrainOwnershipType.Own, ReceivedDate = D(90), SourceFieldId = F3, MoisturePercent = 14.2m, ImpurityPercent = 1.0m, GrainImpurityPercent = 2.5m, ProteinPercent = 9.2m,                      NaturePerLiter = 720, QualityClass = 2, PricePerTon = 5800.0m,  Notes = "Частково реалізовано",     TenantId = DemoTenantId, CreatedAtUtc = now }
            );
            context.GrainBatchPlacements.AddRange(
                new GrainBatchPlacement { GrainBatchId = GB_Wheat, GrainStorageId = GS_West, QuantityTons = 180.0m, TenantId = DemoTenantId, CreatedAtUtc = now },
                new GrainBatchPlacement { GrainBatchId = GB_Sun,   GrainStorageId = GS_East, QuantityTons = 106.4m, TenantId = DemoTenantId, CreatedAtUtc = now },
                new GrainBatchPlacement { GrainBatchId = GB_Corn,  GrainStorageId = GS_East, QuantityTons = 250.0m, TenantId = DemoTenantId, CreatedAtUtc = now }
            );
            context.GrainMovements.AddRange(
                new GrainMovement { GrainBatchId = GB_Wheat, MovementType = GrainMovementType.Receipt,      QuantityTons = 255.0m, MovementDate = D(20), Reason = "Збирання врожаю",                                                          TenantId = DemoTenantId, CreatedAtUtc = now },
                new GrainMovement { GrainBatchId = GB_Wheat, MovementType = GrainMovementType.SaleDispatch, QuantityTons = 75.0m,  MovementDate = D(10), Reason = "Продаж", BuyerName = "Kernel Holding",  PricePerTon = 7200.0m,  TotalRevenue = 540000.0m,  TenantId = DemoTenantId, CreatedAtUtc = now },
                new GrainMovement { GrainBatchId = GB_Corn,  MovementType = GrainMovementType.Receipt,      QuantityTons = 440.0m, MovementDate = D(90), Reason = "Збирання врожаю",                                                          TenantId = DemoTenantId, CreatedAtUtc = now },
                new GrainMovement { GrainBatchId = GB_Corn,  MovementType = GrainMovementType.SaleDispatch, QuantityTons = 190.0m, MovementDate = D(30), Reason = "Продаж", BuyerName = "АДМ Україна",       PricePerTon = 5800.0m,  TotalRevenue = 1102000.0m, TenantId = DemoTenantId, CreatedAtUtc = now }
            );

            // 17. Sales
            context.Sales.AddRange(
                new Sale { Date = D(60), BuyerName = "Kernel Holding", Product = "Пшениця",   Quantity = 150.0m, PricePerUnit = 7200.0m,  TotalAmount = 1080000.0m, FieldId = F1, Notes = "Контракт №К-2024-118",   TenantId = DemoTenantId, CreatedAtUtc = now },
                new Sale { Date = D(45), BuyerName = "МХП",             Product = "Ячмінь",    Quantity = 200.0m, PricePerUnit = 5500.0m,  TotalAmount = 1100000.0m, FieldId = F4, Notes = "Контракт №МХП-2024-32",  TenantId = DemoTenantId, CreatedAtUtc = now },
                new Sale { Date = D(30), BuyerName = "АДМ Україна",     Product = "Кукурудза", Quantity = 190.0m, PricePerUnit = 5800.0m,  TotalAmount = 1102000.0m, FieldId = F3, Notes = "Контракт №АДМ-2024-77",  TenantId = DemoTenantId, CreatedAtUtc = now },
                new Sale { Date = D(15), BuyerName = "Bunge Ukraine",   Product = "Ріпак",     Quantity = 80.0m,  PricePerUnit = 19500.0m, TotalAmount = 1560000.0m, FieldId = F5, Notes = "Контракт №BNG-2024-55",   TenantId = DemoTenantId, CreatedAtUtc = now },
                new Sale { Date = D(10), BuyerName = "Kernel Holding",  Product = "Пшениця",   Quantity = 75.0m,  PricePerUnit = 7200.0m,  TotalAmount = 540000.0m,  FieldId = F1, Notes = "Другий транш пшениці",    TenantId = DemoTenantId, CreatedAtUtc = now }
            );

            // 18. Cost records (12 records)
            context.CostRecords.AddRange(
                new CostRecord { Category = CostCategory.Seeds,      Amount = 171750.0m,  Date = D(220), FieldId = F1, AgroOperationId = Op_Seeding1, Description = "Насіння пшениці 9350 кг × 18.5",   TenantId = DemoTenantId, CreatedAtUtc = now },
                new CostRecord { Category = CostCategory.Seeds,      Amount = 137088.0m,  Date = D(80),  FieldId = F3, AgroOperationId = Op_Seeding2, Description = "Насіння кукурудзи 1375 кг × 72",   TenantId = DemoTenantId, CreatedAtUtc = now },
                new CostRecord { Category = CostCategory.Fertilizer, Amount = 143437.5m,  Date = D(180), FieldId = F1, AgroOperationId = Op_Fertil1,  Description = "Аміачна селітра Захід-1",           TenantId = DemoTenantId, CreatedAtUtc = now },
                new CostRecord { Category = CostCategory.Fertilizer, Amount = 89100.0m,   Date = D(50),  FieldId = F3, AgroOperationId = Op_Fertil1,  Description = "КАС-32 підживлення кукурудзи",      TenantId = DemoTenantId, CreatedAtUtc = now },
                new CostRecord { Category = CostCategory.Pesticide,  Amount = 12325.0m,   Date = D(160), FieldId = F1, AgroOperationId = Op_Protect1, Description = "Гербіцид Раундап 85 л × 145",       TenantId = DemoTenantId, CreatedAtUtc = now },
                new CostRecord { Category = CostCategory.Pesticide,  Amount = 4902.0m,    Date = D(40),  FieldId = F2, AgroOperationId = Op_Protect1, Description = "Фунгіцид Фалькон 22.8 л × 215",     TenantId = DemoTenantId, CreatedAtUtc = now },
                new CostRecord { Category = CostCategory.Fuel,       Amount = 130000.0m,  Date = D(45),  FieldId = F1,                               Description = "Дизпаливо сівба 2500 л × 52",       TenantId = DemoTenantId, CreatedAtUtc = now },
                new CostRecord { Category = CostCategory.Fuel,       Amount = 62400.0m,   Date = D(20),  FieldId = F1,                               Description = "Дизпаливо збирання 1200 л × 52",    TenantId = DemoTenantId, CreatedAtUtc = now },
                new CostRecord { Category = CostCategory.Machinery,  Amount = 12500.0m,   Date = D(30),                                              Description = "ТО трактора John Deere 8R",         TenantId = DemoTenantId, CreatedAtUtc = now },
                new CostRecord { Category = CostCategory.Machinery,  Amount = 28000.0m,   Date = D(10),                                              Description = "Ремонт зерновоза КамАЗ 45143",      TenantId = DemoTenantId, CreatedAtUtc = now },
                new CostRecord { Category = CostCategory.Labor,      Amount = 95000.0m,   Date = D(15),                                              Description = "Зарплата за поточний місяць",       TenantId = DemoTenantId, CreatedAtUtc = now },
                new CostRecord { Category = CostCategory.Lease,      Amount = 182500.0m,  Date = D(100),                                             Description = "Орендна плата за с/г угіддя Q3",   TenantId = DemoTenantId, CreatedAtUtc = now }
            );

            // 19. Budget
            context.Budgets.AddRange(
                new Budget { Year = year, Category = "Насіння",                    PlannedAmount = 420000.0m, Note = "Пшениця, соняшник, кукурудза, ріпак", TenantId = DemoTenantId, CreatedAtUtc = now },
                new Budget { Year = year, Category = "Добрива",                    PlannedAmount = 680000.0m, Note = "Аміачна селітра, КАС, нітроамофоска",  TenantId = DemoTenantId, CreatedAtUtc = now },
                new Budget { Year = year, Category = "ЗЗР",                        PlannedAmount = 195000.0m, Note = "Гербіциди, фунгіциди, інсектициди",    TenantId = DemoTenantId, CreatedAtUtc = now },
                new Budget { Year = year, Category = "Паливо",                     PlannedAmount = 380000.0m, Note = "Дизель для техніки",                   TenantId = DemoTenantId, CreatedAtUtc = now },
                new Budget { Year = year, Category = "Техніка та обслуговування", PlannedAmount = 250000.0m, Note = "ТО, ремонт, запчастини",               TenantId = DemoTenantId, CreatedAtUtc = now },
                new Budget { Year = year, Category = "Оплата праці",               PlannedAmount = 480000.0m, Note = "Зарплата, аванси",                     TenantId = DemoTenantId, CreatedAtUtc = now },
                new Budget { Year = year, Category = "Оренда землі",               PlannedAmount = 730000.0m, Note = "Паї, фіксована оренда",                TenantId = DemoTenantId, CreatedAtUtc = now }
            );

            // 20. Employees
            context.Employees.AddRange(
                new Employee { Id = Emp1, FirstName = "Петро",  LastName = "Харченко", Position = "Тракторист",      Department = "МТС",        HireDate = new DateTime(2020, 3, 1, 0, 0, 0, DateTimeKind.Utc),  SalaryType = "Hourly",    HourlyRate = 180.0m, IsActive = true, TenantId = DemoTenantId, CreatedAtUtc = now },
                new Employee { Id = Emp2, FirstName = "Іван",   LastName = "Бойко",    Position = "Комбайнер",        Department = "МТС",        HireDate = new DateTime(2018, 6, 1, 0, 0, 0, DateTimeKind.Utc),  SalaryType = "Hourly",    HourlyRate = 220.0m, IsActive = true, TenantId = DemoTenantId, CreatedAtUtc = now },
                new Employee { Id = Emp3, FirstName = "Микола", LastName = "Кравець",  Position = "Агроном-захисник", Department = "Агрослужба", HireDate = new DateTime(2021, 4, 15, 0, 0, 0, DateTimeKind.Utc), SalaryType = "Piecework", PieceworkRate = 120.0m, IsActive = true, TenantId = DemoTenantId, CreatedAtUtc = now },
                new Employee { Id = Emp4, FirstName = "Тетяна", LastName = "Бондар",   Position = "Комірник",         Department = "Склад",      HireDate = new DateTime(2019, 9, 1, 0, 0, 0, DateTimeKind.Utc),  SalaryType = "Hourly",    HourlyRate = 150.0m, IsActive = true, TenantId = DemoTenantId, CreatedAtUtc = now }
            );
            context.WorkLogs.AddRange(
                new WorkLog { EmployeeId = Emp1, WorkDate = D(45), HoursWorked = 12.5m, WorkDescription = "Сівба Захід-1",        FieldId = F1, OperationId = Op_Seeding1, AccruedAmount = 2250.0m, IsPaid = true,  TenantId = DemoTenantId, CreatedAtUtc = now },
                new WorkLog { EmployeeId = Emp2, WorkDate = D(20), HoursWorked = 14.0m, WorkDescription = "Збирання пшениці",      FieldId = F1, OperationId = Op_Harvest1, AccruedAmount = 3080.0m, IsPaid = true,  TenantId = DemoTenantId, CreatedAtUtc = now },
                new WorkLog { EmployeeId = Emp3, WorkDate = D(40), HoursWorked = 8.0m,  WorkDescription = "Захист соняшника",      FieldId = F2, OperationId = Op_Protect1, AccruedAmount = 960.0m,  IsPaid = true,  TenantId = DemoTenantId, CreatedAtUtc = now },
                new WorkLog { EmployeeId = Emp1, WorkDate = D(10), HoursWorked = 10.0m, WorkDescription = "Підготовка ґрунту Пар-7", FieldId = F7,                           AccruedAmount = 1800.0m, IsPaid = false, TenantId = DemoTenantId, CreatedAtUtc = now }
            );
            context.SalaryPayments.AddRange(
                new SalaryPayment { EmployeeId = Emp1, Amount = 22500.0m, PaymentDate = D(15), PaymentType = "Salary",  Notes = "Серпень", TenantId = DemoTenantId, CreatedAtUtc = now },
                new SalaryPayment { EmployeeId = Emp2, Amount = 28600.0m, PaymentDate = D(15), PaymentType = "Salary",  Notes = "Серпень", TenantId = DemoTenantId, CreatedAtUtc = now },
                new SalaryPayment { EmployeeId = Emp3, Amount = 18000.0m, PaymentDate = D(15), PaymentType = "Salary",  Notes = "Серпень", TenantId = DemoTenantId, CreatedAtUtc = now },
                new SalaryPayment { EmployeeId = Emp4, Amount = 15000.0m, PaymentDate = D(15), PaymentType = "Salary",  Notes = "Серпень", TenantId = DemoTenantId, CreatedAtUtc = now },
                new SalaryPayment { EmployeeId = Emp1, Amount = 5000.0m,  PaymentDate = D(30), PaymentType = "Advance", Notes = "Аванс",   TenantId = DemoTenantId, CreatedAtUtc = now }
            );

            // 21. Notifications
            context.Notifications.AddRange(
                new Notification { TenantId = DemoTenantId, Type = "warning", Title = "Низький залишок дизпалива",     Body = "Залишок в цистерні — 10 800 л (54%). Рекомендуємо поповнити до збирання.", IsRead = false, CreatedAtUtc = D(1) },
                new Notification { TenantId = DemoTenantId, Type = "info",    Title = "Збирання соняшника в процесі", Body = "Операція на полі Схід-2 (38 га) розпочата. Очікуваний кінець — 2 дні.",    IsRead = false, CreatedAtUtc = D(0) },
                new Notification { TenantId = DemoTenantId, Type = "warning", Title = "КамАЗ 45143 на ремонті",       Body = "Зерновоз ТК-001 на ремонті. Транспортування зерна обмежено.",              IsRead = true,  CreatedAtUtc = D(10) },
                new Notification { TenantId = DemoTenantId, Type = "info",    Title = "Продаж пшениці завершено",     Body = "Реалізовано 225 т пшениці (1 620 000 UAH). Контрагент: Kernel Holding.",  IsRead = true,  CreatedAtUtc = D(9) },
                new Notification { TenantId = DemoTenantId, Type = "info",    Title = "Сезон сівби завершено",        Body = "Засіяно 6 полів, 320.5 га. Залишки насіння — на головному складі.",        IsRead = true,  CreatedAtUtc = D(70) }
            );

            // 22. Audit entries
            context.AuditEntries.AddRange(
                new AuditEntry { TenantId = DemoTenantId, UserId = demoUser.Id, EntityType = "Sale",          EntityId = F1,          Action = "Created", NewValues = """{"BuyerName":"Kernel Holding","TotalAmount":1080000}""", CreatedAtUtc = D(60) },
                new AuditEntry { TenantId = DemoTenantId, UserId = demoUser.Id, EntityType = "AgroOperation", EntityId = Op_Harvest1, Action = "Updated", OldValues = """{"Status":"InProgress"}""", NewValues = """{"Status":"Completed"}""",   CreatedAtUtc = D(20) },
                new AuditEntry { TenantId = DemoTenantId, UserId = demoUser.Id, EntityType = "Machine",       EntityId = M_Truck,     Action = "Updated", OldValues = """{"Status":"Active"}""",     NewValues = """{"Status":"UnderRepair"}""", CreatedAtUtc = D(10) },
                new AuditEntry { TenantId = DemoTenantId, UserId = demoUser.Id, EntityType = "CostRecord",    EntityId = F1,          Action = "Created", NewValues = """{"Category":"Fuel","Amount":130000}""",                               CreatedAtUtc = D(45) }
            );

            await context.SaveChangesAsync();
            logger.LogInformation(
                "Demo environment seeded: 7 fields, 3 warehouses, 2 grain storages, 3 grain batches, 5 machines, 7 operations, 5 sales, 12 costs, 4 employees. Login: {Email} / {Password}",
                DemoEmail, DemoPassword);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error seeding demo environment.");
        }
    }

    // Helpers ---------------------------------------------------------------
    static StockMove Mv(Guid warehouseId, Guid itemId, StockMoveType type, decimal qty, string unit, string note) => new()
    {
        WarehouseId  = warehouseId,
        ItemId       = itemId,
        MoveType     = type,
        Quantity     = qty,
        QuantityBase = qty,
        UnitCode     = unit,
        Note         = note,
        TenantId     = DemoTenantId,
        CreatedAtUtc = DateTime.UtcNow
    };

    static StockBalance Bal(Guid warehouseId, Guid itemId, decimal balance, string unit, DateTime ts) => new()
    {
        WarehouseId    = warehouseId,
        ItemId         = itemId,
        BalanceBase    = balance,
        BaseUnit       = unit,
        LastUpdatedUtc = ts,
        RowVersion     = new byte[8],
        TenantId       = DemoTenantId,
        CreatedAtUtc   = ts
    };
}
