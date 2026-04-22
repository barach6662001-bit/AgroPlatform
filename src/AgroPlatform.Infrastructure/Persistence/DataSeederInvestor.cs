using AgroPlatform.Domain.AgroOperations;
using AgroPlatform.Domain.Economics;
using AgroPlatform.Domain.Enums;
using AgroPlatform.Domain.Fields;
using AgroPlatform.Domain.Fuel;
using AgroPlatform.Domain.HR;
using AgroPlatform.Domain.Machinery;
using AgroPlatform.Domain.Sales;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace AgroPlatform.Infrastructure.Persistence;

/// <summary>
/// Extends the baseline demo seed (from <see cref="DataSeeder.SeedDemoAsync"/>) to investor-demo scale:
/// 80 fields across 4 crops, 25 machines, 12 months of cost records, 8 months of sales, 4 seasons of
/// historical harvests, 12 months of salary payments and fuel transactions.
///
/// Gated by <c>Demo:Scale</c> configuration. Enabled only when the value equals <c>Investor</c>
/// (case-insensitive). Default is <c>Minimal</c> (no-op) so CI / unit tests are not slowed down.
///
/// Idempotent: exits early if the demo tenant already has more than 50 fields.
/// </summary>
public static class DataSeederInvestor
{
    private const int InvestorFieldThreshold = 50;
    private const int WheatCount    = 30;
    private const int SunflowerCount = 20;
    private const int CornCount      = 15;
    private const int RapeseedCount  = 15;
    // Target totals: Wheat 30, Sunflower 20, Corn 15, Rapeseed 15 = 80 fields.

    private static readonly string[] WheatNames =
    {
        "Захід", "Схід", "Північ", "Південь", "Степ", "Балка", "Луг", "Долина",
        "Ярок", "Яр", "Поле", "Нива", "Гора", "Пагорб", "Шлях"
    };

    private static readonly string[] SoilTypes =
    {
        "Чорнозем типовий", "Чорнозем вилугуваний", "Чорнозем звичайний",
        "Лучно-чорноземний", "Темно-каштановий", "Сірий лісовий"
    };

    private static readonly (string Buyer, string Product, decimal BasePrice)[] Buyers =
    {
        ("Kernel Holding",   "Пшениця",   7_500m),
        ("Нібулон",          "Пшениця",   7_800m),
        ("МХП",              "Кукурудза", 6_600m),
        ("АДМ Україна",      "Кукурудза", 6_400m),
        ("Bunge Ukraine",    "Ріпак",    19_500m),
        ("Cargill Україна",  "Соняшник", 19_000m),
        ("Allseeds",         "Соняшник", 20_200m),
        ("Агропросперіс",    "Пшениця",   7_600m),
        ("ViOil",            "Соняшник", 21_000m),
        ("COFCO",            "Кукурудза", 6_800m)
    };

    /// <summary>
    /// Runs after <see cref="DataSeeder.SeedDemoAsync"/>. Safe to call on every app start.
    /// </summary>
    public static async Task ExtendAsync(AppDbContext context, IConfiguration configuration, ILogger logger)
    {
        var scale = configuration["Demo:Scale"];
        if (!string.Equals(scale, "Investor", StringComparison.OrdinalIgnoreCase))
        {
            return;
        }

        var tenantId = DataSeeder.DemoTenantId;

        // Idempotency: already scaled up?
        var currentFieldCount = await context.Fields
            .IgnoreQueryFilters()
            .Where(f => f.TenantId == tenantId)
            .CountAsync();

        if (currentFieldCount >= InvestorFieldThreshold)
        {
            logger.LogInformation("Investor-scale seed already applied ({Count} fields). Skipping.", currentFieldCount);
            return;
        }

        // Ensure the baseline demo was actually created (otherwise there's nothing to extend).
        if (currentFieldCount == 0)
        {
            logger.LogInformation("Baseline demo seed not present. Skipping investor extension.");
            return;
        }

        logger.LogInformation("Applying investor-scale demo seed (current fields: {Count})…", currentFieldCount);

        var now  = DateTime.UtcNow;
        var year = now.Year;
        var rng  = new Random(42); // deterministic

        var existingFields = await context.Fields
            .IgnoreQueryFilters()
            .Where(f => f.TenantId == tenantId)
            .Select(f => new { f.Id, f.CurrentCrop })
            .ToListAsync();

        // 1. Generate additional fields so totals reach target counts per crop.
        var baselineWheat     = existingFields.Count(f => f.CurrentCrop == CropType.Wheat);
        var baselineSunflower = existingFields.Count(f => f.CurrentCrop == CropType.Sunflower);
        var baselineCorn      = existingFields.Count(f => f.CurrentCrop == CropType.Corn);
        var baselineRapeseed  = existingFields.Count(f => f.CurrentCrop == CropType.Rapeseed);

        var generatedFields = new List<Field>();
        generatedFields.AddRange(GenerateFields(
            CropType.Wheat,     WheatCount - baselineWheat,         startIndex: baselineWheat + 1,     rng, tenantId, now, year));
        generatedFields.AddRange(GenerateFields(
            CropType.Sunflower, SunflowerCount - baselineSunflower, startIndex: baselineSunflower + 1, rng, tenantId, now, year));
        generatedFields.AddRange(GenerateFields(
            CropType.Corn,      CornCount - baselineCorn,           startIndex: baselineCorn + 1,      rng, tenantId, now, year));
        generatedFields.AddRange(GenerateFields(
            CropType.Rapeseed,  RapeseedCount - baselineRapeseed,   startIndex: baselineRapeseed + 1,  rng, tenantId, now, year));

        context.Fields.AddRange(generatedFields);
        logger.LogInformation("Added {Count} generated fields.", generatedFields.Count);

        // 2. Seedings for the generated fields (current season).
        foreach (var field in generatedFields)
        {
            context.FieldSeedings.Add(BuildSeeding(field, year, now, rng, tenantId));
        }

        // 3. Historical harvests for prior 3 seasons (year-2, year-3, year-4) across generated fields.
        //    Baseline already has year-1 harvests for F1..F6; we leave those alone.
        var allFieldsForHistory = existingFields.Select(f => (f.Id, f.CurrentCrop))
            .Concat(generatedFields.Select(f => (f.Id, (CropType?)f.CurrentCrop)))
            .ToList();

        var harvests = new List<FieldHarvest>();
        for (var yearOffset = 2; yearOffset <= 4; yearOffset++)
        {
            foreach (var (fieldId, crop) in allFieldsForHistory)
            {
                if (!crop.HasValue || crop == CropType.Fallow) continue;
                harvests.Add(BuildHistoricalHarvest(fieldId, crop.Value, year - yearOffset, rng, tenantId, now));
            }
        }
        context.FieldHarvests.AddRange(harvests);
        logger.LogInformation("Added {Count} historical harvest records ({Seasons} seasons).", harvests.Count, 3);

        // 4. Additional machines to reach 25 total.
        var existingMachineCount = await context.Machines
            .IgnoreQueryFilters()
            .Where(m => m.TenantId == tenantId)
            .CountAsync();

        var additionalMachines = GenerateMachines(count: Math.Max(0, 25 - existingMachineCount), rng, tenantId, now);
        context.Machines.AddRange(additionalMachines);
        logger.LogInformation("Added {Count} machines (total target: 25).", additionalMachines.Count);

        // 5. CostRecords spread across 12 months for generated fields.
        var costRecords = new List<CostRecord>();
        foreach (var field in generatedFields)
        {
            costRecords.AddRange(BuildAnnualCosts(field, rng, tenantId, now));
        }
        context.CostRecords.AddRange(costRecords);
        logger.LogInformation("Added {Count} cost records (12 months).", costRecords.Count);

        // 6. Sales across 8 months with realistic buyers and price variance.
        var sales = BuildSalesHistory(allFieldsForHistory, rng, tenantId, now);
        context.Sales.AddRange(sales);
        logger.LogInformation("Added {Count} sales (8 months).", sales.Count);

        // 7. Salary payments for 12 months (for existing employees only).
        var employees = await context.Employees
            .IgnoreQueryFilters()
            .Where(e => e.TenantId == tenantId)
            .Select(e => new { e.Id, e.SalaryType, e.HourlyRate })
            .ToListAsync();

        var salaries = new List<SalaryPayment>();
        foreach (var emp in employees)
        {
            // 12 months back from now (baseline already covers month 0 partially — we add months 1..11 to avoid duplicates).
            for (var m = 1; m <= 11; m++)
            {
                var amount = (emp.HourlyRate ?? 150m) * 160m + rng.Next(-3000, 3000);
                salaries.Add(new SalaryPayment
                {
                    EmployeeId  = emp.Id,
                    Amount      = Math.Round(amount, 0),
                    PaymentDate = now.AddDays(-m * 30).AddDays(rng.Next(-3, 3)),
                    PaymentType = "Salary",
                    Notes       = $"Зарплата (M-{m})",
                    TenantId    = tenantId,
                    CreatedAtUtc = now
                });
            }
        }
        context.SalaryPayments.AddRange(salaries);
        logger.LogInformation("Added {Count} salary payments (12 months × {Emp} employees).", salaries.Count, employees.Count);

        // 8. Fuel transactions spread across 12 months.
        var dieselTank = await context.FuelTanks
            .IgnoreQueryFilters()
            .Where(t => t.TenantId == tenantId && t.FuelType == FuelType.Diesel)
            .Select(t => t.Id)
            .FirstOrDefaultAsync();

        if (dieselTank != Guid.Empty)
        {
            var fuelTxns = new List<FuelTransaction>();
            for (var m = 1; m <= 11; m++)
            {
                // one receipt + two dispenses per month
                var price = 50m + (decimal)rng.NextDouble() * 4m;
                fuelTxns.Add(new FuelTransaction
                {
                    FuelTankId      = dieselTank,
                    TransactionType = "Receipt",
                    QuantityLiters  = 5000 + rng.Next(0, 5000),
                    PricePerLiter   = Math.Round(price, 2),
                    TotalCost       = 0, // computed below
                    TransactionDate = now.AddDays(-m * 30).AddDays(-1),
                    SupplierName    = rng.Next(0, 2) == 0 ? "Атлант-Нафта" : "ОККО",
                    InvoiceNumber   = $"FUEL-{year}-{m:D2}",
                    TenantId        = tenantId,
                    CreatedAtUtc    = now
                });
                fuelTxns.Add(new FuelTransaction
                {
                    FuelTankId      = dieselTank,
                    TransactionType = "Dispensed",
                    QuantityLiters  = 800 + rng.Next(0, 1200),
                    PricePerLiter   = Math.Round(price, 2),
                    TotalCost       = 0,
                    TransactionDate = now.AddDays(-m * 30).AddDays(5),
                    DriverName      = rng.Next(0, 2) == 0 ? "Петро Харченко" : "Іван Бойко",
                    TenantId        = tenantId,
                    CreatedAtUtc    = now
                });
            }
            foreach (var tx in fuelTxns)
            {
                tx.TotalCost = tx.QuantityLiters * tx.PricePerLiter;
            }
            context.FuelTransactions.AddRange(fuelTxns);
            logger.LogInformation("Added {Count} fuel transactions.", fuelTxns.Count);
        }

        await context.SaveChangesAsync();
        logger.LogInformation(
            "Investor-scale seed complete: +{Fields} fields, +{Machines} machines, +{Harvests} historical harvests, +{Costs} costs, +{Sales} sales, +{Salaries} salaries.",
            generatedFields.Count, additionalMachines.Count, harvests.Count, costRecords.Count, sales.Count, salaries.Count);
    }

    // ─── Generators ────────────────────────────────────────────────────────────

    private static List<Field> GenerateFields(
        CropType crop, int count, int startIndex, Random rng, Guid tenantId, DateTime now, int year)
    {
        if (count <= 0) return new List<Field>();

        var list = new List<Field>(count);
        var cropLabel = crop switch
        {
            CropType.Wheat     => "Пшен",
            CropType.Sunflower => "Сон",
            CropType.Corn      => "Куку",
            CropType.Rapeseed  => "Ріп",
            _                   => "Поле"
        };

        for (var i = 0; i < count; i++)
        {
            var idx = startIndex + i;
            var namePrefix = WheatNames[rng.Next(WheatNames.Length)];

            // lognormal-ish area: 25..180 ha, skewed lower
            var areaRaw = 25 + Math.Pow(rng.NextDouble(), 0.55) * 155;
            var area = (decimal)Math.Round(areaRaw, 1);

            list.Add(new Field
            {
                Id              = Guid.NewGuid(),
                Name            = $"{namePrefix}-{cropLabel}-{idx}",
                AreaHectares    = area,
                CurrentCrop     = crop,
                CurrentCropYear = year,
                SoilType        = SoilTypes[rng.Next(SoilTypes.Length)],
                OwnershipType   = rng.Next(0, 10) < 6 ? LandOwnershipType.OwnLand : LandOwnershipType.Lease,
                TenantId        = tenantId,
                CreatedAtUtc    = now
            });
        }
        return list;
    }

    private static FieldSeeding BuildSeeding(Field field, int year, DateTime now, Random rng, Guid tenantId)
    {
        var (cropName, variety, rateKg, seedingDaysAgo) = field.CurrentCrop switch
        {
            CropType.Wheat     => ("Пшениця озима", RandomVariety(rng, "Подолянка", "Мирлєна", "Смуглянка", "Естафета"), 220m, 200 + rng.Next(-14, 14)),
            CropType.Sunflower => ("Соняшник",       RandomVariety(rng, "НК Роккі", "П63ЛЛ06", "ЛГ 5663 КЛ", "Тунка"), 5m,  85 + rng.Next(-10, 10)),
            CropType.Corn      => ("Кукурудза",      RandomVariety(rng, "Аргентум", "ДКС 3730", "П8834", "Моніка"), 25m,  80 + rng.Next(-10, 10)),
            CropType.Rapeseed  => ("Ріпак озимий",   RandomVariety(rng, "Аберус", "ПТ 234", "Мерседес", "Атенція"), 4m,   210 + rng.Next(-10, 10)),
            _                   => ("Пар",            "-", 0m, 0)
        };

        return new FieldSeeding
        {
            FieldId             = field.Id,
            Year                = year,
            CropName            = cropName,
            Variety             = variety,
            SeedingRateKgPerHa  = rateKg,
            TotalSeedKg         = rateKg * field.AreaHectares,
            SeedingDate         = now.AddDays(-seedingDaysAgo),
            TenantId            = tenantId,
            CreatedAtUtc        = now
        };
    }

    private static FieldHarvest BuildHistoricalHarvest(
        Guid fieldId, CropType crop, int harvestYear, Random rng, Guid tenantId, DateTime now)
    {
        var (cropName, yieldMin, yieldMax, priceMin, priceMax, moisture, month, day) = crop switch
        {
            CropType.Wheat     => ("Пшениця озима", 4.5m, 6.2m, 7_000m,  9_000m,  13.5m, 7, 20),
            CropType.Sunflower => ("Соняшник",       2.4m, 3.2m, 17_500m, 22_000m, 8.0m,  9, 15),
            CropType.Corn      => ("Кукурудза",      7.0m, 10.0m, 6_400m,  7_800m,  14.0m, 10, 5),
            CropType.Rapeseed  => ("Ріпак озимий",   2.8m, 3.6m, 18_500m, 22_500m, 8.5m,  7, 10),
            CropType.Barley    => ("Ячмінь",          4.0m, 5.5m, 5_200m,  6_800m,  12.5m, 7, 10),
            CropType.Soybean   => ("Соя",             2.4m, 3.2m, 13_500m, 16_000m, 12.0m, 10, 1),
            _                   => ("Інше",           3.0m, 5.0m, 5_000m,  7_000m,  13.0m, 8, 1)
        };

        // Estimate area from field record later — use range.
        var yieldPerHa = yieldMin + (decimal)rng.NextDouble() * (yieldMax - yieldMin);
        var pricePerTon = priceMin + (decimal)rng.NextDouble() * (priceMax - priceMin);
        var estimatedArea = 20m + (decimal)rng.NextDouble() * 150m;
        var totalTons = Math.Round(yieldPerHa * estimatedArea, 1);

        return new FieldHarvest
        {
            FieldId         = fieldId,
            Year            = harvestYear,
            CropName        = cropName,
            TotalTons       = totalTons,
            YieldTonsPerHa  = Math.Round(yieldPerHa, 2),
            MoisturePercent = moisture,
            PricePerTon     = Math.Round(pricePerTon, 0),
            TotalRevenue    = Math.Round(totalTons * pricePerTon, 0),
            HarvestDate     = new DateTime(harvestYear, month, day, 0, 0, 0, DateTimeKind.Utc),
            TenantId        = tenantId,
            CreatedAtUtc    = now
        };
    }

    private static List<Machine> GenerateMachines(int count, Random rng, Guid tenantId, DateTime now)
    {
        if (count <= 0) return new List<Machine>();

        var catalog = new (MachineryType Type, string Brand, string Model, decimal FuelPerHour, int Year)[]
        {
            (MachineryType.Tractor,  "John Deere",  "6195M",          18.0m, 2020),
            (MachineryType.Tractor,  "Case IH",     "Magnum 340",     21.0m, 2019),
            (MachineryType.Tractor,  "New Holland", "T7.315",         20.0m, 2021),
            (MachineryType.Tractor,  "МТЗ",         "Беларус 3522",   14.0m, 2018),
            (MachineryType.Tractor,  "Fendt",       "936 Vario",      23.0m, 2022),
            (MachineryType.Tractor,  "John Deere",  "7250R",          19.0m, 2020),
            (MachineryType.Tractor,  "Case IH",     "Puma 240",       17.0m, 2021),
            (MachineryType.Combine,  "Claas",       "Tucano 570",     32.0m, 2019),
            (MachineryType.Combine,  "New Holland", "CR10.90",        38.0m, 2022),
            (MachineryType.Combine,  "John Deere",  "S780i",          36.0m, 2021),
            (MachineryType.Combine,  "Case IH",     "Axial-Flow 9250",37.0m, 2020),
            (MachineryType.Sprayer,  "John Deere",  "R4040i",         7.0m,  2020),
            (MachineryType.Sprayer,  "Amazone",     "UF 1801",        6.5m,  2021),
            (MachineryType.Sprayer,  "Horsch",      "Leeb 6.300",     7.5m,  2022),
            (MachineryType.Seeder,   "Väderstad",   "Rapid A 800S",   11.0m, 2021),
            (MachineryType.Seeder,   "Lemken",      "Solitair 9/800", 10.0m, 2020),
            (MachineryType.Truck,    "МАН",          "TGS 33.400",     22.0m, 2019),
            (MachineryType.Truck,    "Scania",      "G440",           24.0m, 2020),
            (MachineryType.Truck,    "DAF",         "CF 85",          21.0m, 2018),
            (MachineryType.Truck,    "Volvo",       "FH16",           23.0m, 2021),
        };

        var list = new List<Machine>(count);
        for (var i = 0; i < count; i++)
        {
            var entry = catalog[i % catalog.Length];
            var idx = i + 2; // start from 2 (baseline already has 1 of each base type)
            var prefix = entry.Type switch
            {
                MachineryType.Tractor => "TR",
                MachineryType.Combine => "CB",
                MachineryType.Sprayer => "SP",
                MachineryType.Seeder  => "SD",
                MachineryType.Truck   => "TK",
                _ => "MC"
            };
            list.Add(new Machine
            {
                Id                     = Guid.NewGuid(),
                Name                   = $"{entry.Brand} {entry.Model}",
                InventoryNumber        = $"{prefix}-{idx:D3}",
                Type                   = entry.Type,
                Brand                  = entry.Brand,
                Model                  = entry.Model,
                Year                   = entry.Year + rng.Next(-1, 2),
                Status                 = rng.Next(0, 10) < 9 ? MachineryStatus.Active : MachineryStatus.UnderRepair,
                FuelType               = FuelType.Diesel,
                FuelConsumptionPerHour = entry.FuelPerHour,
                TenantId               = tenantId,
                CreatedAtUtc           = now
            });
        }
        return list;
    }

    private static List<CostRecord> BuildAnnualCosts(Field field, Random rng, Guid tenantId, DateTime now)
    {
        var area = field.AreaHectares;
        var records = new List<CostRecord>();

        // Seeds — once at seeding
        records.Add(new CostRecord
        {
            Category     = CostCategory.Seeds,
            Amount       = Math.Round(CostPerHa(field.CurrentCrop, CostCategory.Seeds, rng) * area, 0),
            Date         = SeedingDate(field.CurrentCrop, now, rng),
            FieldId      = field.Id,
            Description  = $"Насіння ({field.Name})",
            TenantId     = tenantId,
            CreatedAtUtc = now
        });

        // Fertilizer — 2 applications
        for (var n = 0; n < 2; n++)
        {
            records.Add(new CostRecord
            {
                Category     = CostCategory.Fertilizer,
                Amount       = Math.Round(CostPerHa(field.CurrentCrop, CostCategory.Fertilizer, rng) * area * 0.5m, 0),
                Date         = now.AddDays(-(90 + n * 120) + rng.Next(-15, 15)),
                FieldId      = field.Id,
                Description  = $"Добрива (застосування {n + 1}, {field.Name})",
                TenantId     = tenantId,
                CreatedAtUtc = now
            });
        }

        // Pesticide — 1-2 applications
        var pestCount = rng.Next(1, 3);
        for (var n = 0; n < pestCount; n++)
        {
            records.Add(new CostRecord
            {
                Category     = CostCategory.Pesticide,
                Amount       = Math.Round(CostPerHa(field.CurrentCrop, CostCategory.Pesticide, rng) * area, 0),
                Date         = now.AddDays(-(60 + n * 90) + rng.Next(-10, 10)),
                FieldId      = field.Id,
                Description  = $"ЗЗР ({field.Name})",
                TenantId     = tenantId,
                CreatedAtUtc = now
            });
        }

        // Fuel — monthly for active months (6 records)
        for (var m = 0; m < 6; m++)
        {
            records.Add(new CostRecord
            {
                Category     = CostCategory.Fuel,
                Amount       = Math.Round((decimal)(rng.NextDouble() * 150 + 80) * area / 30m, 0),
                Date         = now.AddDays(-(m * 45 + rng.Next(0, 15))),
                FieldId      = field.Id,
                Description  = $"Дизпаливо ({field.Name})",
                TenantId     = tenantId,
                CreatedAtUtc = now
            });
        }

        return records;
    }

    private static List<Sale> BuildSalesHistory(
        List<(Guid Id, CropType? Crop)> fields, Random rng, Guid tenantId, DateTime now)
    {
        var list = new List<Sale>();
        // 8 months × ~3-6 sales per month
        for (var m = 0; m < 8; m++)
        {
            var perMonth = rng.Next(3, 7);
            for (var i = 0; i < perMonth; i++)
            {
                var buyer = Buyers[rng.Next(Buyers.Length)];
                var cropType = buyer.Product switch
                {
                    "Пшениця"   => CropType.Wheat,
                    "Соняшник"  => CropType.Sunflower,
                    "Кукурудза" => CropType.Corn,
                    "Ріпак"     => CropType.Rapeseed,
                    _            => (CropType?)null
                };

                var matchingFields = cropType.HasValue
                    ? fields.Where(f => f.Crop == cropType).ToList()
                    : fields;

                if (matchingFields.Count == 0) continue;

                var field = matchingFields[rng.Next(matchingFields.Count)];
                var qty = 50m + (decimal)rng.NextDouble() * 250m;
                var variance = 1m + ((decimal)rng.NextDouble() - 0.5m) * 0.16m; // ±8%
                var pricePerUnit = Math.Round(buyer.BasePrice * variance, 0);

                list.Add(new Sale
                {
                    Date         = now.AddDays(-(m * 30 + rng.Next(0, 28))),
                    BuyerName    = buyer.Buyer,
                    Product      = buyer.Product,
                    Quantity     = Math.Round(qty, 1),
                    PricePerUnit = pricePerUnit,
                    TotalAmount  = Math.Round(qty * pricePerUnit, 0),
                    FieldId      = field.Id,
                    Notes        = $"Контракт №{buyer.Buyer[..3].ToUpperInvariant()}-{now.Year}-{rng.Next(10, 999):D3}",
                    TenantId     = tenantId,
                    CreatedAtUtc = now
                });
            }
        }
        return list;
    }

    // ─── Cost helpers ──────────────────────────────────────────────────────────

    private static decimal CostPerHa(CropType? crop, CostCategory category, Random rng)
    {
        // UAH / ha typical ranges (Ukrainian agri economics, 2024 levels)
        var baseline = (crop, category) switch
        {
            (CropType.Wheat,     CostCategory.Seeds)      => 1_800m,
            (CropType.Wheat,     CostCategory.Fertilizer) => 4_500m,
            (CropType.Wheat,     CostCategory.Pesticide)  => 1_200m,
            (CropType.Sunflower, CostCategory.Seeds)      => 3_200m,
            (CropType.Sunflower, CostCategory.Fertilizer) => 3_000m,
            (CropType.Sunflower, CostCategory.Pesticide)  => 1_800m,
            (CropType.Corn,      CostCategory.Seeds)      => 3_600m,
            (CropType.Corn,      CostCategory.Fertilizer) => 5_500m,
            (CropType.Corn,      CostCategory.Pesticide)  => 2_200m,
            (CropType.Rapeseed,  CostCategory.Seeds)      => 2_400m,
            (CropType.Rapeseed,  CostCategory.Fertilizer) => 4_800m,
            (CropType.Rapeseed,  CostCategory.Pesticide)  => 2_600m,
            _                                              => 2_000m
        };
        var variance = 1m + ((decimal)rng.NextDouble() - 0.5m) * 0.2m; // ±10%
        return baseline * variance;
    }

    private static DateTime SeedingDate(CropType? crop, DateTime now, Random rng)
    {
        var daysAgo = crop switch
        {
            CropType.Wheat     => 200,
            CropType.Rapeseed  => 210,
            CropType.Sunflower => 85,
            CropType.Corn      => 80,
            _                   => 90
        };
        return now.AddDays(-(daysAgo + rng.Next(-10, 10)));
    }

    private static string RandomVariety(Random rng, params string[] options) => options[rng.Next(options.Length)];
}
