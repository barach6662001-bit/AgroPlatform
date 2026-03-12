using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.AgroOperations.Commands.DeleteAgroOperation;
using AgroPlatform.Domain.AgroOperations;
using AgroPlatform.Domain.Enums;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.UnitTests.AgroOperations;

public class DeleteAgroOperationHandlerTests
{
    private static IAppDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<TestDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new TestDbContext(options);
    }

    [Fact]
    public async Task DeleteAgroOperation_ExistingOperation_RemovesFromDatabase()
    {
        var context = CreateDbContext();
        var operation = new AgroOperation
        {
            FieldId = Guid.NewGuid(),
            OperationType = AgroOperationType.Sowing,
            PlannedDate = DateTime.UtcNow.AddDays(5),
        };
        context.AgroOperations.Add(operation);
        await context.SaveChangesAsync();

        var handler = new DeleteAgroOperationHandler(context);
        await handler.Handle(new DeleteAgroOperationCommand(operation.Id), CancellationToken.None);

        var found = await ((TestDbContext)context).AgroOperations.FindAsync(operation.Id);
        found.Should().BeNull();
    }

    [Fact]
    public async Task DeleteAgroOperation_NonExistentId_ThrowsNotFoundException()
    {
        var context = CreateDbContext();
        var handler = new DeleteAgroOperationHandler(context);

        var act = async () => await handler.Handle(new DeleteAgroOperationCommand(Guid.NewGuid()), CancellationToken.None);

        await act.Should().ThrowAsync<NotFoundException>();
    }
}
