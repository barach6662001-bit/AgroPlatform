using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Fields.Commands.UpdateField;
using AgroPlatform.Domain.Fields;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.UnitTests.Fields;

public class UpdateFieldHandlerTests
{
    private static IAppDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<TestDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new TestDbContext(options);
    }

    [Fact]
    public async Task UpdateField_ExistingField_UpdatesProperties()
    {
        var context = CreateDbContext();
        var field = new Field { Name = "Old Name", AreaHectares = 10m };
        context.Fields.Add(field);
        await context.SaveChangesAsync();

        var handler = new UpdateFieldHandler(context);
        var command = new UpdateFieldCommand(field.Id, "New Name", null, 20m, null, null, null, "Loam", null);
        await handler.Handle(command, CancellationToken.None);

        var updated = await ((TestDbContext)context).Fields.FindAsync(field.Id);
        updated!.Name.Should().Be("New Name");
        updated.AreaHectares.Should().Be(20m);
        updated.SoilType.Should().Be("Loam");
    }

    [Fact]
    public async Task UpdateField_NonExistentId_ThrowsNotFoundException()
    {
        var context = CreateDbContext();
        var handler = new UpdateFieldHandler(context);
        var command = new UpdateFieldCommand(Guid.NewGuid(), "Name", null, 10m, null, null, null, null, null);

        var act = async () => await handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<NotFoundException>();
    }
}
