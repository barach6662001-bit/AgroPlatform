using AgroPlatform.Application.AgroOperations.Commands.AddMachinery;
using AgroPlatform.Application.AgroOperations.Commands.AddResource;
using AgroPlatform.Application.AgroOperations.Commands.CompleteAgroOperation;
using AgroPlatform.Application.AgroOperations.Commands.CreateAgroOperation;
using AgroPlatform.Application.AgroOperations.Commands.DeleteAgroOperation;
using AgroPlatform.Application.AgroOperations.Commands.RemoveMachinery;
using AgroPlatform.Application.AgroOperations.Commands.RemoveResource;
using AgroPlatform.Application.AgroOperations.Commands.UpdateAgroOperation;
using AgroPlatform.Application.AgroOperations.Commands.UpdateMachinery;
using AgroPlatform.Application.AgroOperations.Commands.UpdateResourceActual;
using AgroPlatform.Application.AgroOperations.Queries.GetAgroOperationById;
using AgroPlatform.Application.AgroOperations.Queries.GetAgroOperations;
using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.AgroOperations;
using AgroPlatform.Domain.Enums;
using AgroPlatform.Domain.Fields;
using AgroPlatform.Domain.Machinery;
using AgroPlatform.Domain.Warehouses;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.UnitTests.AgroOperations;

public class AgroOperationHandlerTests
{
    private sealed class TestNotificationService : INotificationService
    {
        public Task SendAsync(Guid tenantId, string type, string title, string body, CancellationToken cancellationToken = default)
            => Task.CompletedTask;
    }

    private sealed class TestCurrentUserService : ICurrentUserService
    {
        public string? UserId => null;
        public string? UserName => null;
        public Guid TenantId { get; } = Guid.NewGuid();
        public UserRole? Role => null;
        public bool IsInRole(UserRole role) => false;
    }

    private static IAppDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<TestDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new TestDbContext(options);
    }

    // ── CreateAgroOperation ──────────────────────────────────────────────────

    [Fact]
    public async Task CreateAgroOperation_ValidCommand_ReturnsNewId()
    {
        var context = CreateDbContext();
        var field = new Field { Name = "North Field", AreaHectares = 50m };
        context.Fields.Add(field);
        await context.SaveChangesAsync();

        var handler = new CreateAgroOperationHandler(context);
        var command = new CreateAgroOperationCommand(field.Id, AgroOperationType.Sowing, DateTime.UtcNow.AddDays(5), "Test op", null);

        var id = await handler.Handle(command, CancellationToken.None);

        id.Should().NotBeEmpty();
        var op = await ((TestDbContext)context).AgroOperations.FindAsync(id);
        op.Should().NotBeNull();
        op!.FieldId.Should().Be(field.Id);
        op.OperationType.Should().Be(AgroOperationType.Sowing);
        op.IsCompleted.Should().BeTrue();
        op.CompletedDate.Should().NotBeNull();
    }

    [Fact]
    public async Task CreateAgroOperation_FieldNotFound_ThrowsNotFoundException()
    {
        var context = CreateDbContext();
        var handler = new CreateAgroOperationHandler(context);
        var command = new CreateAgroOperationCommand(Guid.NewGuid(), AgroOperationType.Sowing, DateTime.UtcNow, null, null);

        var act = () => handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<NotFoundException>();
    }

    // ── UpdateAgroOperation ──────────────────────────────────────────────────

    [Fact]
    public async Task UpdateAgroOperation_ExistingOperation_UpdatesProperties()
    {
        var context = CreateDbContext();
        var field = new Field { Name = "Field", AreaHectares = 10m };
        context.Fields.Add(field);
        var op = new AgroOperation { FieldId = field.Id, OperationType = AgroOperationType.Sowing, PlannedDate = DateTime.UtcNow };
        context.AgroOperations.Add(op);
        await context.SaveChangesAsync();

        var newDate = DateTime.UtcNow.AddDays(10);
        var handler = new UpdateAgroOperationHandler(context);
        await handler.Handle(new UpdateAgroOperationCommand(op.Id, newDate, "Updated", 25m), CancellationToken.None);

        var updated = await ((TestDbContext)context).AgroOperations.FindAsync(op.Id);
        updated!.PlannedDate.Should().Be(newDate);
        updated.Description.Should().Be("Updated");
        updated.AreaProcessed.Should().Be(25m);
    }

    [Fact]
    public async Task UpdateAgroOperation_NotFound_ThrowsNotFoundException()
    {
        var context = CreateDbContext();
        var handler = new UpdateAgroOperationHandler(context);

        var act = () => handler.Handle(new UpdateAgroOperationCommand(Guid.NewGuid(), DateTime.UtcNow, null, null), CancellationToken.None);

        await act.Should().ThrowAsync<NotFoundException>();
    }

    // ── DeleteAgroOperation ──────────────────────────────────────────────────

    [Fact]
    public async Task DeleteAgroOperation_ExistingOperation_RemovesIt()
    {
        var context = CreateDbContext();
        var field = new Field { Name = "Field", AreaHectares = 10m };
        context.Fields.Add(field);
        var op = new AgroOperation { FieldId = field.Id, OperationType = AgroOperationType.Harvesting, PlannedDate = DateTime.UtcNow };
        context.AgroOperations.Add(op);
        await context.SaveChangesAsync();

        var handler = new DeleteAgroOperationHandler(context);
        await handler.Handle(new DeleteAgroOperationCommand(op.Id), CancellationToken.None);

        var found = await ((TestDbContext)context).AgroOperations.FindAsync(op.Id);
        found.Should().BeNull();
    }

    [Fact]
    public async Task DeleteAgroOperation_NotFound_ThrowsNotFoundException()
    {
        var context = CreateDbContext();
        var handler = new DeleteAgroOperationHandler(context);

        var act = () => handler.Handle(new DeleteAgroOperationCommand(Guid.NewGuid()), CancellationToken.None);

        await act.Should().ThrowAsync<NotFoundException>();
    }

    // ── CompleteAgroOperation ────────────────────────────────────────────────

    [Fact]
    public async Task CompleteAgroOperation_NoResources_SetsIsCompleted()
    {
        var context = CreateDbContext();
        var field = new Field { Name = "Field", AreaHectares = 10m };
        context.Fields.Add(field);
        var op = new AgroOperation { FieldId = field.Id, OperationType = AgroOperationType.Sowing, PlannedDate = DateTime.UtcNow };
        context.AgroOperations.Add(op);
        await context.SaveChangesAsync();

        var handler = new CompleteAgroOperationHandler(context, new TestNotificationService(), new TestCurrentUserService());
        var completedDate = DateTime.UtcNow;
        await handler.Handle(new CompleteAgroOperationCommand(op.Id, completedDate, 30m), CancellationToken.None);

        var updated = await ((TestDbContext)context).AgroOperations.FindAsync(op.Id);
        updated!.IsCompleted.Should().BeTrue();
        updated.CompletedDate.Should().Be(completedDate);
        updated.AreaProcessed.Should().Be(30m);
    }

    [Fact]
    public async Task CompleteAgroOperation_WithResourceAndSufficientBalance_CreatesStockMove()
    {
        var context = CreateDbContext();
        var field = new Field { Name = "Field", AreaHectares = 10m };
        context.Fields.Add(field);
        var warehouse = new Warehouse { Name = "Main", IsActive = true };
        context.Warehouses.Add(warehouse);
        var item = new WarehouseItem { Name = "Fertilizer", Code = "FERT001", Category = "Chemicals", BaseUnit = "kg" };
        context.WarehouseItems.Add(item);
        var balance = new StockBalance { WarehouseId = warehouse.Id, ItemId = item.Id, BalanceBase = 100m, BaseUnit = "kg", LastUpdatedUtc = DateTime.UtcNow };
        context.StockBalances.Add(balance);
        var op = new AgroOperation { FieldId = field.Id, OperationType = AgroOperationType.Fertilizing, PlannedDate = DateTime.UtcNow };
        context.AgroOperations.Add(op);
        await context.SaveChangesAsync();

        var resource = new AgroOperationResource
        {
            AgroOperationId = op.Id,
            WarehouseItemId = item.Id,
            WarehouseId = warehouse.Id,
            PlannedQuantity = 50m,
            ActualQuantity = 40m,
            UnitCode = "kg"
        };
        context.AgroOperationResources.Add(resource);
        await context.SaveChangesAsync();

        var handler = new CompleteAgroOperationHandler(context, new TestNotificationService(), new TestCurrentUserService());
        await handler.Handle(new CompleteAgroOperationCommand(op.Id, DateTime.UtcNow, null), CancellationToken.None);

        var updatedBalance = await ((TestDbContext)context).StockBalances
            .FirstOrDefaultAsync(b => b.WarehouseId == warehouse.Id && b.ItemId == item.Id);
        updatedBalance!.BalanceBase.Should().Be(60m);

        var updatedResource = await ((TestDbContext)context).AgroOperationResources.FindAsync(resource.Id);
        updatedResource!.StockMoveId.Should().NotBeNull();
    }

    [Fact]
    public async Task CompleteAgroOperation_WithPurchasePrice_CreatesCostRecord()
    {
        var context = CreateDbContext();
        var field = new Field { Name = "Field", AreaHectares = 10m };
        context.Fields.Add(field);
        var warehouse = new Warehouse { Name = "Main", IsActive = true };
        context.Warehouses.Add(warehouse);
        var item = new WarehouseItem { Name = "NPK", Code = "NPK001", Category = "Fertilizers", BaseUnit = "kg", PurchasePrice = 25m };
        context.WarehouseItems.Add(item);
        var balance = new StockBalance { WarehouseId = warehouse.Id, ItemId = item.Id, BalanceBase = 100m, BaseUnit = "kg", LastUpdatedUtc = DateTime.UtcNow };
        context.StockBalances.Add(balance);
        var op = new AgroOperation { FieldId = field.Id, OperationType = AgroOperationType.Fertilizing, PlannedDate = DateTime.UtcNow };
        context.AgroOperations.Add(op);
        await context.SaveChangesAsync();

        var resource = new AgroOperationResource
        {
            AgroOperationId = op.Id,
            WarehouseItemId = item.Id,
            WarehouseId = warehouse.Id,
            PlannedQuantity = 50m,
            ActualQuantity = 40m,
            UnitCode = "kg"
        };
        context.AgroOperationResources.Add(resource);
        await context.SaveChangesAsync();

        var completedDate = DateTime.UtcNow;
        var handler = new CompleteAgroOperationHandler(context, new TestNotificationService(), new TestCurrentUserService());
        await handler.Handle(new CompleteAgroOperationCommand(op.Id, completedDate, null), CancellationToken.None);

        var costRecord = await ((TestDbContext)context).CostRecords
            .FirstOrDefaultAsync(c => c.AgroOperationId == op.Id);
        costRecord.Should().NotBeNull();
        costRecord!.Amount.Should().Be(1000m); // 40 kg × 25 UAH
        costRecord.Category.Should().Be(CostCategory.Fertilizer);
        costRecord.Currency.Should().Be("UAH");
        costRecord.FieldId.Should().Be(field.Id);
        costRecord.Date.Should().Be(completedDate);
    }

    [Fact]
    public async Task CompleteAgroOperation_WithNoPurchasePrice_NoCostRecord()
    {
        var context = CreateDbContext();
        var field = new Field { Name = "Field", AreaHectares = 10m };
        context.Fields.Add(field);
        var warehouse = new Warehouse { Name = "Main", IsActive = true };
        context.Warehouses.Add(warehouse);
        var item = new WarehouseItem { Name = "Agrochemical", Code = "FERT002", Category = "Chemicals", BaseUnit = "kg" }; // No PurchasePrice
        context.WarehouseItems.Add(item);
        var balance = new StockBalance { WarehouseId = warehouse.Id, ItemId = item.Id, BalanceBase = 100m, BaseUnit = "kg", LastUpdatedUtc = DateTime.UtcNow };
        context.StockBalances.Add(balance);
        var op = new AgroOperation { FieldId = field.Id, OperationType = AgroOperationType.Fertilizing, PlannedDate = DateTime.UtcNow };
        context.AgroOperations.Add(op);
        await context.SaveChangesAsync();

        var resource = new AgroOperationResource
        {
            AgroOperationId = op.Id,
            WarehouseItemId = item.Id,
            WarehouseId = warehouse.Id,
            PlannedQuantity = 50m,
            ActualQuantity = 40m,
            UnitCode = "kg"
        };
        context.AgroOperationResources.Add(resource);
        await context.SaveChangesAsync();

        var handler = new CompleteAgroOperationHandler(context, new TestNotificationService(), new TestCurrentUserService());
        await handler.Handle(new CompleteAgroOperationCommand(op.Id, DateTime.UtcNow, null), CancellationToken.None);

        var costRecordCount = await ((TestDbContext)context).CostRecords
            .CountAsync(c => c.AgroOperationId == op.Id);
        costRecordCount.Should().Be(0);
    }

    [Fact]
    public async Task CompleteAgroOperation_NotFound_ThrowsNotFoundException()
    {
        var context = CreateDbContext();
        var handler = new CompleteAgroOperationHandler(context, new TestNotificationService(), new TestCurrentUserService());

        var act = () => handler.Handle(new CompleteAgroOperationCommand(Guid.NewGuid(), DateTime.UtcNow, null), CancellationToken.None);

        await act.Should().ThrowAsync<NotFoundException>();
    }

    // ── AddResource ──────────────────────────────────────────────────────────

    [Fact]
    public async Task AddResource_ValidCommand_ReturnsNewId()
    {
        var context = CreateDbContext();
        var field = new Field { Name = "Field", AreaHectares = 10m };
        context.Fields.Add(field);
        var warehouse = new Warehouse { Name = "Main", IsActive = true };
        context.Warehouses.Add(warehouse);
        var item = new WarehouseItem { Name = "Seeds", Code = "SEED001", Category = "Seeds", BaseUnit = "kg" };
        context.WarehouseItems.Add(item);
        var op = new AgroOperation { FieldId = field.Id, OperationType = AgroOperationType.Sowing, PlannedDate = DateTime.UtcNow };
        context.AgroOperations.Add(op);
        await context.SaveChangesAsync();

        var handler = new AddResourceHandler(context);
        var command = new AddResourceCommand(op.Id, item.Id, warehouse.Id, 100m, "kg");
        var resourceId = await handler.Handle(command, CancellationToken.None);

        resourceId.Should().NotBeEmpty();
        var resource = await ((TestDbContext)context).AgroOperationResources.FindAsync(resourceId);
        resource.Should().NotBeNull();
        resource!.PlannedQuantity.Should().Be(100m);
    }

    [Fact]
    public async Task AddResource_OperationNotFound_ThrowsNotFoundException()
    {
        var context = CreateDbContext();
        var item = new WarehouseItem { Name = "Seeds", Code = "SEED002", Category = "Seeds", BaseUnit = "kg" };
        context.WarehouseItems.Add(item);
        await context.SaveChangesAsync();

        var handler = new AddResourceHandler(context);
        var command = new AddResourceCommand(Guid.NewGuid(), item.Id, Guid.NewGuid(), 100m, "kg");

        var act = () => handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<NotFoundException>();
    }

    // ── UpdateResourceActual ─────────────────────────────────────────────────

    [Fact]
    public async Task UpdateResourceActual_ExistingResource_UpdatesActualQuantity()
    {
        var context = CreateDbContext();
        var field = new Field { Name = "Field", AreaHectares = 10m };
        context.Fields.Add(field);
        var item = new WarehouseItem { Name = "Seeds", Code = "SEED003", Category = "Seeds", BaseUnit = "kg" };
        context.WarehouseItems.Add(item);
        var op = new AgroOperation { FieldId = field.Id, OperationType = AgroOperationType.Sowing, PlannedDate = DateTime.UtcNow };
        context.AgroOperations.Add(op);
        var resource = new AgroOperationResource { AgroOperationId = op.Id, WarehouseItemId = item.Id, WarehouseId = Guid.NewGuid(), PlannedQuantity = 50m, UnitCode = "kg" };
        context.AgroOperationResources.Add(resource);
        await context.SaveChangesAsync();

        var handler = new UpdateResourceActualHandler(context);
        await handler.Handle(new UpdateResourceActualCommand(resource.Id, 45m), CancellationToken.None);

        var updated = await ((TestDbContext)context).AgroOperationResources.FindAsync(resource.Id);
        updated!.ActualQuantity.Should().Be(45m);
    }

    // ── RemoveResource ───────────────────────────────────────────────────────

    [Fact]
    public async Task RemoveResource_ExistingResource_RemovesIt()
    {
        var context = CreateDbContext();
        var field = new Field { Name = "Field", AreaHectares = 10m };
        context.Fields.Add(field);
        var item = new WarehouseItem { Name = "Seeds", Code = "SEED004", Category = "Seeds", BaseUnit = "kg" };
        context.WarehouseItems.Add(item);
        var op = new AgroOperation { FieldId = field.Id, OperationType = AgroOperationType.Sowing, PlannedDate = DateTime.UtcNow };
        context.AgroOperations.Add(op);
        var resource = new AgroOperationResource { AgroOperationId = op.Id, WarehouseItemId = item.Id, WarehouseId = Guid.NewGuid(), PlannedQuantity = 50m, UnitCode = "kg" };
        context.AgroOperationResources.Add(resource);
        await context.SaveChangesAsync();

        var handler = new RemoveResourceHandler(context);
        await handler.Handle(new RemoveResourceCommand(resource.Id), CancellationToken.None);

        var found = await ((TestDbContext)context).AgroOperationResources.FindAsync(resource.Id);
        found.Should().BeNull();
    }

    // ── AddMachinery ─────────────────────────────────────────────────────────

    [Fact]
    public async Task AddMachinery_ValidCommand_ReturnsNewId()
    {
        var context = CreateDbContext();
        var field = new Field { Name = "Field", AreaHectares = 10m };
        context.Fields.Add(field);
        var machine = new Machine { Name = "Tractor", InventoryNumber = "TRC-001", Type = MachineryType.Tractor, FuelType = FuelType.Diesel };
        context.Machines.Add(machine);
        var op = new AgroOperation { FieldId = field.Id, OperationType = AgroOperationType.SoilTillage, PlannedDate = DateTime.UtcNow };
        context.AgroOperations.Add(op);
        await context.SaveChangesAsync();

        var handler = new AddMachineryHandler(context);
        var command = new AddMachineryCommand(op.Id, machine.Id, 8m, 50m, "John");
        var machineryId = await handler.Handle(command, CancellationToken.None);

        machineryId.Should().NotBeEmpty();
        var machinery = await ((TestDbContext)context).AgroOperationMachineries.FindAsync(machineryId);
        machinery.Should().NotBeNull();
        machinery!.HoursWorked.Should().Be(8m);
        machinery.OperatorName.Should().Be("John");
    }

    [Fact]
    public async Task AddMachinery_MachineNotFound_ThrowsNotFoundException()
    {
        var context = CreateDbContext();
        var field = new Field { Name = "Field", AreaHectares = 10m };
        context.Fields.Add(field);
        var op = new AgroOperation { FieldId = field.Id, OperationType = AgroOperationType.SoilTillage, PlannedDate = DateTime.UtcNow };
        context.AgroOperations.Add(op);
        await context.SaveChangesAsync();

        var handler = new AddMachineryHandler(context);
        var command = new AddMachineryCommand(op.Id, Guid.NewGuid(), null, null, null);

        var act = () => handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<NotFoundException>();
    }

    // ── UpdateMachinery ──────────────────────────────────────────────────────

    [Fact]
    public async Task UpdateMachinery_ExistingMachinery_UpdatesProperties()
    {
        var context = CreateDbContext();
        var field = new Field { Name = "Field", AreaHectares = 10m };
        context.Fields.Add(field);
        var machine = new Machine { Name = "Tractor", InventoryNumber = "TRC-002", Type = MachineryType.Tractor, FuelType = FuelType.Diesel };
        context.Machines.Add(machine);
        var op = new AgroOperation { FieldId = field.Id, OperationType = AgroOperationType.SoilTillage, PlannedDate = DateTime.UtcNow };
        context.AgroOperations.Add(op);
        var machinery = new AgroOperationMachinery { AgroOperationId = op.Id, MachineId = machine.Id };
        context.AgroOperationMachineries.Add(machinery);
        await context.SaveChangesAsync();

        var handler = new UpdateMachineryHandler(context);
        await handler.Handle(new UpdateMachineryCommand(machinery.Id, 10m, 70m, "Pete"), CancellationToken.None);

        var updated = await ((TestDbContext)context).AgroOperationMachineries.FindAsync(machinery.Id);
        updated!.HoursWorked.Should().Be(10m);
        updated.FuelUsed.Should().Be(70m);
        updated.OperatorName.Should().Be("Pete");
    }

    // ── RemoveMachinery ──────────────────────────────────────────────────────

    [Fact]
    public async Task RemoveMachinery_ExistingMachinery_RemovesIt()
    {
        var context = CreateDbContext();
        var field = new Field { Name = "Field", AreaHectares = 10m };
        context.Fields.Add(field);
        var machine = new Machine { Name = "Tractor", InventoryNumber = "TRC-003", Type = MachineryType.Tractor, FuelType = FuelType.Diesel };
        context.Machines.Add(machine);
        var op = new AgroOperation { FieldId = field.Id, OperationType = AgroOperationType.SoilTillage, PlannedDate = DateTime.UtcNow };
        context.AgroOperations.Add(op);
        var machinery = new AgroOperationMachinery { AgroOperationId = op.Id, MachineId = machine.Id };
        context.AgroOperationMachineries.Add(machinery);
        await context.SaveChangesAsync();

        var handler = new RemoveMachineryHandler(context);
        await handler.Handle(new RemoveMachineryCommand(machinery.Id), CancellationToken.None);

        var found = await ((TestDbContext)context).AgroOperationMachineries.FindAsync(machinery.Id);
        found.Should().BeNull();
    }

    // ── GetAgroOperations ────────────────────────────────────────────────────

    [Fact]
    public async Task GetAgroOperations_NoFilter_ReturnsAll()
    {
        var context = CreateDbContext();
        var field = new Field { Name = "Field A", AreaHectares = 10m };
        context.Fields.Add(field);
        context.AgroOperations.Add(new AgroOperation { FieldId = field.Id, OperationType = AgroOperationType.Sowing, PlannedDate = DateTime.UtcNow });
        context.AgroOperations.Add(new AgroOperation { FieldId = field.Id, OperationType = AgroOperationType.Harvesting, PlannedDate = DateTime.UtcNow.AddDays(1) });
        await context.SaveChangesAsync();

        var handler = new GetAgroOperationsHandler(context);
        var result = await handler.Handle(new GetAgroOperationsQuery(null, null, null, null, null), CancellationToken.None);

        result.Items.Should().HaveCount(2);
    }

    [Fact]
    public async Task GetAgroOperations_FilterByFieldId_ReturnsMatchingOperations()
    {
        var context = CreateDbContext();
        var field1 = new Field { Name = "Field A", AreaHectares = 10m };
        var field2 = new Field { Name = "Field B", AreaHectares = 20m };
        context.Fields.Add(field1);
        context.Fields.Add(field2);
        context.AgroOperations.Add(new AgroOperation { FieldId = field1.Id, OperationType = AgroOperationType.Sowing, PlannedDate = DateTime.UtcNow });
        context.AgroOperations.Add(new AgroOperation { FieldId = field2.Id, OperationType = AgroOperationType.Harvesting, PlannedDate = DateTime.UtcNow });
        await context.SaveChangesAsync();

        var handler = new GetAgroOperationsHandler(context);
        var result = await handler.Handle(new GetAgroOperationsQuery(field1.Id, null, null, null, null), CancellationToken.None);

        result.Items.Should().HaveCount(1);
        result.Items[0].FieldId.Should().Be(field1.Id);
    }

    // ── GetAgroOperationById ─────────────────────────────────────────────────

    [Fact]
    public async Task GetAgroOperationById_ExistingOperation_ReturnsDetail()
    {
        var context = CreateDbContext();
        var field = new Field { Name = "Field", AreaHectares = 10m };
        context.Fields.Add(field);
        var op = new AgroOperation { FieldId = field.Id, OperationType = AgroOperationType.Sowing, PlannedDate = DateTime.UtcNow, Description = "Spring sowing" };
        context.AgroOperations.Add(op);
        await context.SaveChangesAsync();

        var handler = new GetAgroOperationByIdHandler(context);
        var result = await handler.Handle(new GetAgroOperationByIdQuery(op.Id), CancellationToken.None);

        result.Should().NotBeNull();
        result!.Description.Should().Be("Spring sowing");
        result.FieldName.Should().Be("Field");
    }

    [Fact]
    public async Task GetAgroOperationById_NotFound_ReturnsNull()
    {
        var context = CreateDbContext();
        var handler = new GetAgroOperationByIdHandler(context);

        var result = await handler.Handle(new GetAgroOperationByIdQuery(Guid.NewGuid()), CancellationToken.None);

        result.Should().BeNull();
    }
}
