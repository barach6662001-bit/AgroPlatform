using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Economics.Commands.CreateCostRecord;
using AgroPlatform.Domain.AgroOperations;
using AgroPlatform.Domain.Enums;
using AgroPlatform.Domain.Fields;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.UnitTests.Economics;

public class CreateCostRecordHandlerTests
{
    private static IAppDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<TestDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new TestDbContext(options);
    }

    [Fact]
    public async Task CreateCostRecord_ValidCommand_ReturnsNonEmptyGuid()
    {
        var context = CreateDbContext();
        var handler = new CreateCostRecordHandler(context);
        var command = new CreateCostRecordCommand("Fuel", 1500m, "UAH", DateTime.UtcNow, null, null, null);

        var id = await handler.Handle(command, CancellationToken.None);

        id.Should().NotBeEmpty();
    }

    [Fact]
    public async Task CreateCostRecord_ValidCommand_PersistsCostRecordInDatabase()
    {
        var context = CreateDbContext();
        var handler = new CreateCostRecordHandler(context);
        var date = new DateTime(2024, 4, 15, 0, 0, 0, DateTimeKind.Utc);
        var command = new CreateCostRecordCommand("Seeds", 3200m, "UAH", date, null, null, "Spring sowing seeds");

        var id = await handler.Handle(command, CancellationToken.None);

        var record = await ((TestDbContext)context).CostRecords.FindAsync(id);
        record.Should().NotBeNull();
        record!.Category.Should().Be("Seeds");
        record.Amount.Should().Be(3200m);
        record.Currency.Should().Be("UAH");
        record.Date.Should().Be(date);
        record.Description.Should().Be("Spring sowing seeds");
    }

    [Fact]
    public async Task CreateCostRecord_WithFieldId_StoresFieldReference()
    {
        var context = CreateDbContext();
        var field = new Field { Name = "Cost Field", AreaHectares = 50m };
        context.Fields.Add(field);
        await context.SaveChangesAsync();

        var handler = new CreateCostRecordHandler(context);
        var command = new CreateCostRecordCommand("Fertilizer", 2500m, "UAH", DateTime.UtcNow, field.Id, null, null);

        var id = await handler.Handle(command, CancellationToken.None);

        var record = await ((TestDbContext)context).CostRecords.FindAsync(id);
        record!.FieldId.Should().Be(field.Id);
    }

    [Fact]
    public async Task CreateCostRecord_WithAgroOperationId_StoresOperationReference()
    {
        var context = CreateDbContext();
        var field = new Field { Name = "Op Field", AreaHectares = 30m };
        context.Fields.Add(field);
        var operation = new AgroOperation { FieldId = field.Id, OperationType = AgroOperationType.Sowing, PlannedDate = DateTime.UtcNow };
        context.AgroOperations.Add(operation);
        await context.SaveChangesAsync();

        var handler = new CreateCostRecordHandler(context);
        var command = new CreateCostRecordCommand("Labor", 800m, "UAH", DateTime.UtcNow, null, operation.Id, null);

        var id = await handler.Handle(command, CancellationToken.None);

        var record = await ((TestDbContext)context).CostRecords.FindAsync(id);
        record!.AgroOperationId.Should().Be(operation.Id);
    }

    [Fact]
    public async Task CreateCostRecord_WithoutOptionalFields_StoresWithNullReferences()
    {
        var context = CreateDbContext();
        var handler = new CreateCostRecordHandler(context);
        var command = new CreateCostRecordCommand("Maintenance", 500m, "UAH", DateTime.UtcNow, null, null, null);

        var id = await handler.Handle(command, CancellationToken.None);

        var record = await ((TestDbContext)context).CostRecords.FindAsync(id);
        record!.FieldId.Should().BeNull();
        record.AgroOperationId.Should().BeNull();
        record.Description.Should().BeNull();
    }

    [Fact]
    public async Task CreateCostRecord_MultipleCostRecords_EachGetsUniqueId()
    {
        var context = CreateDbContext();
        var handler = new CreateCostRecordHandler(context);

        var id1 = await handler.Handle(new CreateCostRecordCommand("Fuel", 1000m, "UAH", DateTime.UtcNow, null, null, null), CancellationToken.None);
        var id2 = await handler.Handle(new CreateCostRecordCommand("Seeds", 2000m, "UAH", DateTime.UtcNow, null, null, null), CancellationToken.None);

        id1.Should().NotBe(id2);
        var count = await ((TestDbContext)context).CostRecords.CountAsync();
        count.Should().Be(2);
    }
}
