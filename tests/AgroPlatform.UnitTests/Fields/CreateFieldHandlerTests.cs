using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Fields.Commands.CreateField;
using AgroPlatform.Application.Fields.Queries.GetFieldById;
using AgroPlatform.Domain.Enums;
using AgroPlatform.Domain.Fields;
using AgroPlatform.UnitTests.TestDoubles;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.UnitTests.Fields;

public class CreateFieldHandlerTests
{
    private static IAppDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<TestDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new TestDbContext(options);
    }

    private static FakeCurrentUserService CreateCurrentUser() => new() { TenantId = Guid.NewGuid() };

    // ── CreateField ──────────────────────────────────────────────────────────

    [Fact]
    public async Task CreateField_ValidCommand_ReturnsNonEmptyGuid()
    {
        var context = CreateDbContext();
        var handler = new CreateFieldHandler(context, CreateCurrentUser());
        var command = new CreateFieldCommand("South Field", "KD-1234", 75.0m, CropType.Wheat, 2024, null, "Loam", null);

        var id = await handler.Handle(command, CancellationToken.None);

        id.Should().NotBeEmpty();
    }

    [Fact]
    public async Task CreateField_ValidCommand_PersistsFieldInDatabase()
    {
        var context = CreateDbContext();
        var handler = new CreateFieldHandler(context, CreateCurrentUser());
        var command = new CreateFieldCommand("East Field", null, 30.5m, null, null, null, null, "Test notes");

        var id = await handler.Handle(command, CancellationToken.None);

        var field = await ((TestDbContext)context).Fields.FindAsync(id);
        field.Should().NotBeNull();
        field!.Name.Should().Be("East Field");
        field.AreaHectares.Should().Be(30.5m);
        field.Notes.Should().Be("Test notes");
    }

    [Fact]
    public async Task CreateField_WithCrop_SetsCropProperties()
    {
        var context = CreateDbContext();
        var handler = new CreateFieldHandler(context, CreateCurrentUser());
        var command = new CreateFieldCommand("Wheat Field", null, 50m, CropType.Wheat, 2024, null, null, null);

        var id = await handler.Handle(command, CancellationToken.None);

        var field = await ((TestDbContext)context).Fields.FindAsync(id);
        field!.CurrentCrop.Should().Be(CropType.Wheat);
        field.CurrentCropYear.Should().Be(2024);
    }

    // ── GetFieldById ─────────────────────────────────────────────────────────

    [Fact]
    public async Task GetFieldById_ExistingField_ReturnsFieldDetail()
    {
        var context = CreateDbContext();
        var field = new Field { Name = "Target Field", AreaHectares = 20m, SoilType = "Sandy" };
        context.Fields.Add(field);
        await context.SaveChangesAsync();

        var handler = new GetFieldByIdHandler(context);
        var result = await handler.Handle(new GetFieldByIdQuery(field.Id), CancellationToken.None);

        result.Should().NotBeNull();
        result!.Id.Should().Be(field.Id);
        result.Name.Should().Be("Target Field");
        result.SoilType.Should().Be("Sandy");
    }

    [Fact]
    public async Task GetFieldById_NonExistentId_ReturnsNull()
    {
        var context = CreateDbContext();
        var handler = new GetFieldByIdHandler(context);

        var result = await handler.Handle(new GetFieldByIdQuery(Guid.NewGuid()), CancellationToken.None);

        result.Should().BeNull();
    }
}
