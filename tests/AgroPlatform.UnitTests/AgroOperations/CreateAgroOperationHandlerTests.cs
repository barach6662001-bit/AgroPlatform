using AgroPlatform.Application.AgroOperations.Commands.CreateAgroOperation;
using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.AgroOperations;
using AgroPlatform.Domain.Enums;
using AgroPlatform.Domain.Fields;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.UnitTests.AgroOperations;

public class CreateAgroOperationHandlerTests
{
    private static IAppDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<TestDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new TestDbContext(options);
    }

    [Fact]
    public async Task CreateAgroOperation_ValidCommand_ReturnsNonEmptyGuid()
    {
        var context = CreateDbContext();
        var field = new Field { Name = "Sowing Field", AreaHectares = 40m };
        context.Fields.Add(field);
        await context.SaveChangesAsync();

        var handler = new CreateAgroOperationHandler(context);
        var command = new CreateAgroOperationCommand(field.Id, AgroOperationType.Sowing, DateTime.UtcNow.AddDays(3), null, null);

        var id = await handler.Handle(command, CancellationToken.None);

        id.Should().NotBeEmpty();
    }

    [Fact]
    public async Task CreateAgroOperation_ValidCommand_PersistsOperationLinkedToField()
    {
        var context = CreateDbContext();
        var field = new Field { Name = "Target Field", AreaHectares = 60m };
        context.Fields.Add(field);
        await context.SaveChangesAsync();

        var handler = new CreateAgroOperationHandler(context);
        var plannedDate = DateTime.UtcNow.AddDays(7);
        var command = new CreateAgroOperationCommand(field.Id, AgroOperationType.Fertilizing, plannedDate, "Spring fertilizing", null);

        var id = await handler.Handle(command, CancellationToken.None);

        var operation = await ((TestDbContext)context).AgroOperations.FindAsync(id);
        operation.Should().NotBeNull();
        operation!.FieldId.Should().Be(field.Id);
        operation.OperationType.Should().Be(AgroOperationType.Fertilizing);
        operation.PlannedDate.Should().Be(plannedDate);
        operation.Description.Should().Be("Spring fertilizing");
    }

    [Fact]
    public async Task CreateAgroOperation_NewOperation_IsNotCompletedByDefault()
    {
        var context = CreateDbContext();
        var field = new Field { Name = "Test Field", AreaHectares = 25m };
        context.Fields.Add(field);
        await context.SaveChangesAsync();

        var handler = new CreateAgroOperationHandler(context);
        var command = new CreateAgroOperationCommand(field.Id, AgroOperationType.Harvesting, DateTime.UtcNow.AddDays(30), null, null);

        var id = await handler.Handle(command, CancellationToken.None);

        var operation = await ((TestDbContext)context).AgroOperations.FindAsync(id);
        operation!.IsCompleted.Should().BeFalse();
    }

    [Fact]
    public async Task CreateAgroOperation_NonExistentField_ThrowsNotFoundException()
    {
        var context = CreateDbContext();
        var handler = new CreateAgroOperationHandler(context);
        var command = new CreateAgroOperationCommand(Guid.NewGuid(), AgroOperationType.Sowing, DateTime.UtcNow, null, null);

        var act = () => handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task CreateAgroOperation_MultipleOperations_EachLinkedToCorrectField()
    {
        var context = CreateDbContext();
        var fieldA = new Field { Name = "Field A", AreaHectares = 10m };
        var fieldB = new Field { Name = "Field B", AreaHectares = 20m };
        context.Fields.Add(fieldA);
        context.Fields.Add(fieldB);
        await context.SaveChangesAsync();

        var handler = new CreateAgroOperationHandler(context);
        var idA = await handler.Handle(new CreateAgroOperationCommand(fieldA.Id, AgroOperationType.Sowing, DateTime.UtcNow, null, null), CancellationToken.None);
        var idB = await handler.Handle(new CreateAgroOperationCommand(fieldB.Id, AgroOperationType.SoilTillage, DateTime.UtcNow, null, null), CancellationToken.None);

        var opA = await ((TestDbContext)context).AgroOperations.FindAsync(idA);
        var opB = await ((TestDbContext)context).AgroOperations.FindAsync(idB);

        opA!.FieldId.Should().Be(fieldA.Id);
        opB!.FieldId.Should().Be(fieldB.Id);
        idA.Should().NotBe(idB);
    }
}
