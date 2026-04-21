using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Fields.Commands.UpdateFieldGeometry;
using AgroPlatform.Domain.Fields;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;
using NSubstitute;

namespace AgroPlatform.UnitTests.Fields;

public class UpdateFieldGeometryHandlerTests
{
    private const string ValidPolygonGeoJson =
        "{\"type\":\"Polygon\",\"coordinates\":[[[30.0,10.0],[40.0,40.0],[20.0,40.0],[10.0,20.0],[30.0,10.0]]]}";

    // Leaflet's drawnItems.toGeoJSON() produces a FeatureCollection like this
    private const string ValidFeatureCollectionGeoJson =
        "{\"type\":\"FeatureCollection\",\"features\":[{\"type\":\"Feature\",\"geometry\":{\"type\":\"Polygon\",\"coordinates\":[[[30.0,10.0],[40.0,40.0],[20.0,40.0],[10.0,20.0],[30.0,10.0]]]},\"properties\":{}}]}";

    private const string InvalidGeoJson = "not-valid-json";

    private static DbSet<Field> CreateMockDbSetWithFields(List<Field> fieldList)
    {
        var fields = fieldList.AsQueryable();
        var mockDbSet = Substitute.For<DbSet<Field>, IQueryable<Field>, IAsyncEnumerable<Field>>();
        ((IQueryable<Field>)mockDbSet).Provider.Returns(
            new TestAsyncQueryProvider<Field>(fields.Provider));
        ((IQueryable<Field>)mockDbSet).Expression.Returns(fields.Expression);
        ((IQueryable<Field>)mockDbSet).ElementType.Returns(fields.ElementType);
        ((IQueryable<Field>)mockDbSet).GetEnumerator().Returns(fields.GetEnumerator());
        ((IAsyncEnumerable<Field>)mockDbSet).GetAsyncEnumerator(Arg.Any<CancellationToken>())
            .Returns(new TestAsyncEnumerator<Field>(fields.GetEnumerator()));
        return mockDbSet;
    }

    // Helper: create a mock context that returns a specific field when queried
    private static (IAppDbContext context, Field field) CreateMockContextWithField()
    {
        var field = new Field { Name = "Test Field", AreaHectares = 10m };
        var mockDbSet = CreateMockDbSetWithFields([field]);

        var context = Substitute.For<IAppDbContext>();
        context.Fields.Returns(mockDbSet);
        context.SaveChangesAsync(Arg.Any<CancellationToken>()).Returns(1);

        return (context, field);
    }

    [Fact]
    public async Task Handle_ExistingField_SetsGeometryAndGeoJson()
    {
        var (context, field) = CreateMockContextWithField();
        var handler = new UpdateFieldGeometryHandler(context);
        var command = new UpdateFieldGeometryCommand(field.Id, ValidPolygonGeoJson);

        await handler.Handle(command, CancellationToken.None);

        field.Geometry.Should().NotBeNull();
        field.GeoJson.Should().Be(ValidPolygonGeoJson);
        await context.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_NonExistentField_ThrowsNotFoundException()
    {
        var mockDbSet = CreateMockDbSetWithFields([]);
        var context = Substitute.For<IAppDbContext>();
        context.Fields.Returns(mockDbSet);

        var handler = new UpdateFieldGeometryHandler(context);
        var command = new UpdateFieldGeometryCommand(Guid.NewGuid(), ValidPolygonGeoJson);

        var act = async () => await handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task Handle_InvalidGeoJson_ThrowsJsonException()
    {
        var (context, field) = CreateMockContextWithField();
        var handler = new UpdateFieldGeometryHandler(context);
        var command = new UpdateFieldGeometryCommand(field.Id, InvalidGeoJson);

        var act = async () => await handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<System.Text.Json.JsonException>();
    }

    [Fact]
    public async Task Handle_ExistingField_SetsSRID4326()
    {
        var (context, field) = CreateMockContextWithField();
        var handler = new UpdateFieldGeometryHandler(context);
        var command = new UpdateFieldGeometryCommand(field.Id, ValidPolygonGeoJson);

        await handler.Handle(command, CancellationToken.None);

        field.Geometry.Should().NotBeNull();
        field.Geometry!.SRID.Should().Be(4326);
    }

    [Fact]
    public async Task Handle_FeatureCollectionGeoJson_SetsGeometryAndGeoJson()
    {
        var (context, field) = CreateMockContextWithField();
        var handler = new UpdateFieldGeometryHandler(context);
        var command = new UpdateFieldGeometryCommand(field.Id, ValidFeatureCollectionGeoJson);

        await handler.Handle(command, CancellationToken.None);

        field.Geometry.Should().NotBeNull();
        field.Geometry.Should().BeOfType<NetTopologySuite.Geometries.Polygon>();
        field.GeoJson.Should().Be(ValidFeatureCollectionGeoJson);
        await context.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_FeatureCollectionGeoJson_SetsSRID4326()
    {
        var (context, field) = CreateMockContextWithField();
        var handler = new UpdateFieldGeometryHandler(context);
        var command = new UpdateFieldGeometryCommand(field.Id, ValidFeatureCollectionGeoJson);

        await handler.Handle(command, CancellationToken.None);

        field.Geometry.Should().NotBeNull();
        field.Geometry!.SRID.Should().Be(4326);
    }
}


