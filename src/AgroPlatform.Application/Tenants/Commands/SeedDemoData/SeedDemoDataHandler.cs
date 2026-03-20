using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Enums;
using AgroPlatform.Domain.Fields;
using AgroPlatform.Domain.Fuel;
using AgroPlatform.Domain.HR;
using AgroPlatform.Domain.Machinery;
using AgroPlatform.Domain.Warehouses;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Tenants.Commands.SeedDemoData;

public class SeedDemoDataHandler : IRequestHandler<SeedDemoDataCommand>
{
    private readonly IAppDbContext _context;

    public SeedDemoDataHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task Handle(SeedDemoDataCommand request, CancellationToken ct)
    {
        // Skip if data already exists
        if (await _context.Fields.AnyAsync(ct))
            return;

        // === FIELDS ===
        var fields = new[]
        {
            new Field { Name = "Пшеничне", AreaHectares = 120, CurrentCrop = CropType.Wheat, OwnershipType = LandOwnershipType.OwnLand },
            new Field { Name = "Кукурудзяне", AreaHectares = 85, CurrentCrop = CropType.Corn, OwnershipType = LandOwnershipType.Lease },
            new Field { Name = "Соняшникове", AreaHectares = 95, CurrentCrop = CropType.Sunflower, OwnershipType = LandOwnershipType.OwnLand },
            new Field { Name = "Рапсове", AreaHectares = 60, CurrentCrop = CropType.Rapeseed, OwnershipType = LandOwnershipType.ShareLease },
            new Field { Name = "Ячмінне", AreaHectares = 70, CurrentCrop = CropType.Barley, OwnershipType = LandOwnershipType.OwnLand },
        };
        _context.Fields.AddRange(fields);

        // === MACHINERY ===
        var machines = new[]
        {
            new Machine { Name = "John Deere 6130R", InventoryNumber = "JD-001", Type = MachineryType.Tractor, Brand = "John Deere", Model = "6130R", Year = 2020, FuelType = FuelType.Diesel, Status = MachineryStatus.Active },
            new Machine { Name = "CLAAS Lexion 770", InventoryNumber = "CL-001", Type = MachineryType.Combine, Brand = "CLAAS", Model = "Lexion 770", Year = 2021, FuelType = FuelType.Diesel, Status = MachineryStatus.Active },
            new Machine { Name = "Amazone UX 5201", InventoryNumber = "AZ-001", Type = MachineryType.Sprayer, Brand = "Amazone", Model = "UX 5201", Year = 2019, FuelType = FuelType.Diesel, Status = MachineryStatus.Active },
        };
        _context.Machines.AddRange(machines);

        // === WAREHOUSE + ITEMS ===
        var warehouse = new Warehouse { Name = "Головний склад", Location = "с. Центральне", IsActive = true };
        _context.Warehouses.Add(warehouse);

        var items = new[]
        {
            new WarehouseItem { Name = "NPK 16-16-16", Code = "NPK-16", Category = "Fertilizers", BaseUnit = "кг", PurchasePrice = 28.50m, MinimumQuantity = 500 },
            new WarehouseItem { Name = "КАС-32", Code = "KAS-32", Category = "Fertilizers", BaseUnit = "л", PurchasePrice = 22.00m, MinimumQuantity = 1000 },
            new WarehouseItem { Name = "Гліфосат", Code = "GLIF-01", Category = "Pesticides", BaseUnit = "л", PurchasePrice = 185.00m, MinimumQuantity = 50 },
            new WarehouseItem { Name = "Тебуконазол", Code = "TEB-01", Category = "Pesticides", BaseUnit = "л", PurchasePrice = 320.00m },
            new WarehouseItem { Name = "Насіння пшениці Шестопалівка", Code = "SEED-PW", Category = "Seeds", BaseUnit = "кг", PurchasePrice = 18.00m },
            new WarehouseItem { Name = "Насіння кукурудзи DKC 4541", Code = "SEED-CK", Category = "Seeds", BaseUnit = "п.о.", PurchasePrice = 4500.00m },
        };
        _context.WarehouseItems.AddRange(items);

        // === FUEL TANKS ===
        var tanks = new[]
        {
            new FuelTank { Name = "Дизель основний", FuelType = FuelType.Diesel, CapacityLiters = 10000, CurrentLiters = 7500, PricePerLiter = 57.00m, IsActive = true },
            new FuelTank { Name = "Бензин", FuelType = FuelType.Gasoline, CapacityLiters = 3000, CurrentLiters = 1800, PricePerLiter = 55.00m, IsActive = true },
        };
        _context.FuelTanks.AddRange(tanks);

        // === EMPLOYEES ===
        var hireDate = new DateTime(2022, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        var employees = new[]
        {
            new Employee { FirstName = "Іван", LastName = "Петренко", Position = "Головний агроном", SalaryType = "Hourly", HourlyRate = 250, Department = "Агрономія", HireDate = hireDate },
            new Employee { FirstName = "Олексій", LastName = "Коваленко", Position = "Механізатор", SalaryType = "Hourly", HourlyRate = 200, Department = "Механізація", HireDate = hireDate },
            new Employee { FirstName = "Марія", LastName = "Шевченко", Position = "Бухгалтер", SalaryType = "Hourly", HourlyRate = 180, Department = "Бухгалтерія", HireDate = hireDate },
        };
        _context.Employees.AddRange(employees);

        await _context.SaveChangesAsync(ct);
    }
}
