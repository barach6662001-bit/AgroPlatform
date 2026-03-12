using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.AgroOperations.Commands.UpdateAgroOperation;
using AgroPlatform.Domain.AgroOperations;
using AgroPlatform.Domain.Enums;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.UnitTests.AgroOperations;

public class UpdateAgroOperationHandlerTests
{
    private static IAppDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<TestDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new TestDbContext(options);
    }

    [Fact]
    public async Task UpdateAgroOperation_ExistingOperation_UpdatesProperties()
    {
        var context = CreateDbContext();
        var operation = new AgroOperation
        {
            FieldId = Guid.NewGuid(),
            OperationType = AgroOperationType.Sowing,
            PlannedDate = DateTime.UtcNow.AddDays(5),
            Description = "Old description",
        };
        context.AgroOperations.Add(operation);
        await context.SaveChangesAsync();

        var newDate = DateTime.UtcNow.AddDays(10);
        var handler = new UpdateAgroOperationHandler(context);
        var command = new UpdateAgroOperationCommand(operation.Id, newDate, "New description", 25.5m);
        await handler.Handle(command, CancellationToken.None);

        var updated = await ((TestDbContext)context).AgroOperations.FindAsync(operation.Id);
        updated!.PlannedDate.Should().BeCloseTo(newDate, TimeSpan.FromSeconds(1));
        updated.Description.Should().Be("New description");
        updated.AreaProcessed.Should().Be(25.5m);
    }

    [Fact]
    public async Task UpdateAgroOperation_NonExistentId_ThrowsNotFoundException()
    {
        var context = CreateDbContext();
        var handler = new UpdateAgroOperationHandler(context);
        var command = new UpdateAgroOperationCommand(Guid.NewGuid(), DateTime.UtcNow, null, null);

        var act = async () => await handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<NotFoundException>();
    }
}
