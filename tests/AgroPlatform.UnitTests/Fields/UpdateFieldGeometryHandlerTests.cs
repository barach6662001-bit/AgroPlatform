using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Fields.Commands.UpdateFieldGeometry;
using AgroPlatform.Domain.Fields;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.UnitTests.Fields;

public class UpdateFieldGeometryHandlerTests
{
    private const string ValidPolygonGeoJson =
        "{\"type\":\"Polygon\",\"coordinates\":[[[30.0,10.0],[40.0,40.0],[20.0,40.0],[10.0,20.0],[30.0,10.0]]]}";

    private static TestDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<TestDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new TestDbContext(options);
    }

    [Fact]
    public async Task Handle_ExistingField_SetsGeometryAndGeoJson()
    {
        var context = CreateDbContext();
        var field = new Field { Name = "Test Field", AreaHectares = 10m };
        context.Fields.Add(field);
        await context.SaveChangesAsync();

        var handler = new UpdateFieldGeometryHandler(context);
        var command = new UpdateFieldGeometryCommand(field.Id, ValidPolygonGeoJson);

        await handler.Handle(command, CancellationToken.None);

        var updated = await context.Fields.FindAsync(field.Id);
        updated!.Geometry.Should().NotBeNull();
        updated.GeoJson.Should().Be(ValidPolygonGeoJson);
    }

    [Fact]
    public async Task Handle_NonExistentField_ThrowsNotFoundException()
    {
        var context = CreateDbContext();
        var handler = new UpdateFieldGeometryHandler(context);
        var command = new UpdateFieldGeometryCommand(Guid.NewGuid(), ValidPolygonGeoJson);

        var act = async () => await handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task Handle_InvalidGeoJson_ThrowsJsonException()
    {
        var context = CreateDbContext();
        var field = new Field { Name = "Test Field", AreaHectares = 10m };
        context.Fields.Add(field);
        await context.SaveChangesAsync();

        var handler = new UpdateFieldGeometryHandler(context);
        var command = new UpdateFieldGeometryCommand(field.Id, "not-valid-json");

        var act = async () => await handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<System.Text.Json.JsonException>();
    }

    [Fact]
    public async Task Handle_ExistingField_SetsSRID4326()
    {
        var context = CreateDbContext();
        var field = new Field { Name = "SRID Field", AreaHectares = 5m };
        context.Fields.Add(field);
        await context.SaveChangesAsync();

        var handler = new UpdateFieldGeometryHandler(context);
        var command = new UpdateFieldGeometryCommand(field.Id, ValidPolygonGeoJson);

        await handler.Handle(command, CancellationToken.None);

        var updated = await context.Fields.FindAsync(field.Id);
        updated!.Geometry!.SRID.Should().Be(4326);
    }
}
