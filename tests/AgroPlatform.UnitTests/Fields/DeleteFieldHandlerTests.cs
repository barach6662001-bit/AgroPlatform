using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Fields.Commands.DeleteField;
using AgroPlatform.Domain.Fields;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.UnitTests.Fields;

public class DeleteFieldHandlerTests
{
    private static IAppDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<TestDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new TestDbContext(options);
    }

    [Fact]
    public async Task DeleteField_ExistingField_RemovesFromDatabase()
    {
        var context = CreateDbContext();
        var field = new Field { Name = "Test Field", AreaHectares = 10m };
        context.Fields.Add(field);
        await context.SaveChangesAsync();

        var handler = new DeleteFieldHandler(context);
        await handler.Handle(new DeleteFieldCommand(field.Id), CancellationToken.None);

        var found = await ((TestDbContext)context).Fields.FindAsync(field.Id);
        found.Should().BeNull();
    }

    [Fact]
    public async Task DeleteField_NonExistentId_ThrowsNotFoundException()
    {
        var context = CreateDbContext();
        var handler = new DeleteFieldHandler(context);

        var act = async () => await handler.Handle(new DeleteFieldCommand(Guid.NewGuid()), CancellationToken.None);

        await act.Should().ThrowAsync<NotFoundException>();
    }
}
