using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Fields.Queries.GetFields;
using AgroPlatform.Domain.Enums;
using AgroPlatform.Domain.Fields;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.UnitTests.Fields;

public class GetFieldsHandlerTests
{
    private static IAppDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<TestDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new TestDbContext(options);
    }

    [Fact]
    public async Task GetFields_NoFilter_ReturnsAllFields()
    {
        var context = CreateDbContext();
        context.Fields.Add(new Field { Name = "Field Alpha", AreaHectares = 15m });
        context.Fields.Add(new Field { Name = "Field Beta", AreaHectares = 25m });
        context.Fields.Add(new Field { Name = "Field Gamma", AreaHectares = 35m });
        await context.SaveChangesAsync();

        var handler = new GetFieldsHandler(context);
        var result = await handler.Handle(new GetFieldsQuery(null, null), CancellationToken.None);

        result.Should().HaveCount(3);
    }

    [Fact]
    public async Task GetFields_FilterByCrop_ReturnsOnlyMatchingFields()
    {
        var context = CreateDbContext();
        context.Fields.Add(new Field { Name = "Corn Field 1", AreaHectares = 10m, CurrentCrop = CropType.Corn });
        context.Fields.Add(new Field { Name = "Corn Field 2", AreaHectares = 20m, CurrentCrop = CropType.Corn });
        context.Fields.Add(new Field { Name = "Barley Field", AreaHectares = 30m, CurrentCrop = CropType.Barley });
        await context.SaveChangesAsync();

        var handler = new GetFieldsHandler(context);
        var result = await handler.Handle(new GetFieldsQuery(CropType.Corn, null), CancellationToken.None);

        result.Should().HaveCount(2);
        result.Should().AllSatisfy(f => f.CurrentCrop.Should().Be(CropType.Corn));
    }

    [Fact]
    public async Task GetFields_FilterByCrop_NoMatch_ReturnsEmpty()
    {
        var context = CreateDbContext();
        context.Fields.Add(new Field { Name = "Wheat Field", AreaHectares = 10m, CurrentCrop = CropType.Wheat });
        await context.SaveChangesAsync();

        var handler = new GetFieldsHandler(context);
        var result = await handler.Handle(new GetFieldsQuery(CropType.Sunflower, null), CancellationToken.None);

        result.Should().BeEmpty();
    }

    [Fact]
    public async Task GetFields_SearchByName_ReturnsMatchingFields()
    {
        var context = CreateDbContext();
        context.Fields.Add(new Field { Name = "Northern Plains", AreaHectares = 10m });
        context.Fields.Add(new Field { Name = "Southern Meadow", AreaHectares = 20m });
        context.Fields.Add(new Field { Name = "Northern Hills", AreaHectares = 30m });
        await context.SaveChangesAsync();

        var handler = new GetFieldsHandler(context);
        var result = await handler.Handle(new GetFieldsQuery(null, "northern"), CancellationToken.None);

        result.Should().HaveCount(2);
        result.Should().AllSatisfy(f => f.Name.ToLower().Should().Contain("northern"));
    }

    [Fact]
    public async Task GetFields_SearchByCadastralNumber_ReturnsMatchingFields()
    {
        var context = CreateDbContext();
        context.Fields.Add(new Field { Name = "Plot A", AreaHectares = 10m, CadastralNumber = "KD-0001" });
        context.Fields.Add(new Field { Name = "Plot B", AreaHectares = 20m, CadastralNumber = "LV-0002" });
        await context.SaveChangesAsync();

        var handler = new GetFieldsHandler(context);
        var result = await handler.Handle(new GetFieldsQuery(null, "kd-"), CancellationToken.None);

        result.Should().HaveCount(1);
        result[0].Name.Should().Be("Plot A");
    }

    [Fact]
    public async Task GetFields_SearchAndCropFilter_ReturnsIntersection()
    {
        var context = CreateDbContext();
        context.Fields.Add(new Field { Name = "North Wheat", AreaHectares = 10m, CurrentCrop = CropType.Wheat });
        context.Fields.Add(new Field { Name = "North Corn", AreaHectares = 20m, CurrentCrop = CropType.Corn });
        context.Fields.Add(new Field { Name = "South Wheat", AreaHectares = 30m, CurrentCrop = CropType.Wheat });
        await context.SaveChangesAsync();

        var handler = new GetFieldsHandler(context);
        var result = await handler.Handle(new GetFieldsQuery(CropType.Wheat, "north"), CancellationToken.None);

        result.Should().HaveCount(1);
        result[0].Name.Should().Be("North Wheat");
    }
}
