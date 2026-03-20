using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Fields.Commands.CreateVraMap;
using AgroPlatform.Application.Fields.Commands.DeleteVraMap;
using AgroPlatform.Application.Fields.Queries.ExportVraMapCsv;
using AgroPlatform.Application.Fields.Queries.GetVraMaps;
using AgroPlatform.Domain.Fields;
using AgroPlatform.UnitTests;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.UnitTests.Fields;

public class VraMapHandlerTests
{
    private static TestDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<TestDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new TestDbContext(options);
    }

    private static IReadOnlyList<CreateVraZoneCommand> SampleZones() =>
    [
        new(1, "Zone 1", 0.4m, 2.5m, 80m, 40m, 120m, 5m, 150m, "#ff0000"),
        new(2, "Zone 2", 0.6m, 3.2m, 100m, 50m, 140m, 8m, 120m, "#ffaa00"),
        new(3, "Zone 3", 0.8m, 4.1m, 120m, 60m, 160m, 7m, 90m,  "#00cc00"),
    ];

    // ── CreateVraMap ─────────────────────────────────────────────────────────

    [Fact]
    public async Task CreateVraMap_ValidCommand_ReturnsId()
    {
        var context = CreateDbContext();
        var field = new Field { Name = "Test Field", AreaHectares = 20m };
        context.Fields.Add(field);
        await context.SaveChangesAsync();

        var handler = new CreateVraMapHandler(context);
        var command = new CreateVraMapCommand(field.Id, "Spring Map", "NPK 16:16:16", 2026, null, SampleZones());

        var id = await handler.Handle(command, CancellationToken.None);

        id.Should().NotBeEmpty();
        var map = await context.VraMaps.Include(m => m.Zones).FirstOrDefaultAsync(m => m.Id == id);
        map.Should().NotBeNull();
        map!.Name.Should().Be("Spring Map");
        map.FertilizerName.Should().Be("NPK 16:16:16");
        map.Year.Should().Be(2026);
        map.Zones.Should().HaveCount(3);
    }

    [Fact]
    public async Task CreateVraMap_FieldNotFound_Throws()
    {
        var context = CreateDbContext();
        var handler = new CreateVraMapHandler(context);
        var command = new CreateVraMapCommand(Guid.NewGuid(), "Map", "Urea", 2026, null, SampleZones());

        var act = () => handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<NotFoundException>();
    }

    // ── GetVraMaps ───────────────────────────────────────────────────────────

    [Fact]
    public async Task GetVraMaps_ReturnsForField()
    {
        var context = CreateDbContext();
        var field = new Field { Name = "Field A", AreaHectares = 10m };
        context.Fields.Add(field);
        await context.SaveChangesAsync();

        var createHandler = new CreateVraMapHandler(context);
        await createHandler.Handle(new CreateVraMapCommand(field.Id, "Map 1", "Urea", 2025, null, SampleZones()), CancellationToken.None);
        await createHandler.Handle(new CreateVraMapCommand(field.Id, "Map 2", "KAS", 2026, null, SampleZones()), CancellationToken.None);

        var queryHandler = new GetVraMapsHandler(context);
        var result = await queryHandler.Handle(new GetVraMapsQuery(field.Id), CancellationToken.None);

        result.Should().HaveCount(2);
        result.All(m => m.Zones.Count == 3).Should().BeTrue();
    }

    [Fact]
    public async Task GetVraMaps_FilterByYear_ReturnsFiltered()
    {
        var context = CreateDbContext();
        var field = new Field { Name = "Field B", AreaHectares = 10m };
        context.Fields.Add(field);
        await context.SaveChangesAsync();

        var createHandler = new CreateVraMapHandler(context);
        await createHandler.Handle(new CreateVraMapCommand(field.Id, "Map 2025", "Urea", 2025, null, SampleZones()), CancellationToken.None);
        await createHandler.Handle(new CreateVraMapCommand(field.Id, "Map 2026", "KAS", 2026, null, SampleZones()), CancellationToken.None);

        var queryHandler = new GetVraMapsHandler(context);
        var result = await queryHandler.Handle(new GetVraMapsQuery(field.Id, 2026), CancellationToken.None);

        result.Should().HaveCount(1);
        result[0].Name.Should().Be("Map 2026");
    }

    // ── DeleteVraMap ─────────────────────────────────────────────────────────

    [Fact]
    public async Task DeleteVraMap_ExistingMap_Removes()
    {
        var context = CreateDbContext();
        var field = new Field { Name = "Field C", AreaHectares = 10m };
        context.Fields.Add(field);
        await context.SaveChangesAsync();

        var createHandler = new CreateVraMapHandler(context);
        var id = await createHandler.Handle(new CreateVraMapCommand(field.Id, "Map", "Urea", 2026, null, SampleZones()), CancellationToken.None);

        var deleteHandler = new DeleteVraMapHandler(context);
        await deleteHandler.Handle(new DeleteVraMapCommand(id), CancellationToken.None);

        var map = await context.VraMaps.FindAsync(id);
        map.Should().BeNull();
    }

    [Fact]
    public async Task DeleteVraMap_NotFound_Throws()
    {
        var context = CreateDbContext();
        var deleteHandler = new DeleteVraMapHandler(context);

        var act = () => deleteHandler.Handle(new DeleteVraMapCommand(Guid.NewGuid()), CancellationToken.None);

        await act.Should().ThrowAsync<NotFoundException>();
    }

    // ── ExportVraMapCsv ───────────────────────────────────────────────────────

    [Fact]
    public async Task ExportVraMapCsv_ValidMap_ReturnsCsvBytes()
    {
        var context = CreateDbContext();
        var field = new Field { Name = "Field D", AreaHectares = 20m };
        context.Fields.Add(field);
        await context.SaveChangesAsync();

        var createHandler = new CreateVraMapHandler(context);
        var id = await createHandler.Handle(new CreateVraMapCommand(field.Id, "CSV Map", "Urea", 2026, null, SampleZones()), CancellationToken.None);

        var exportHandler = new ExportVraMapCsvHandler(context);
        var bytes = await exportHandler.Handle(new ExportVraMapCsvQuery(id), CancellationToken.None);

        bytes.Should().NotBeEmpty();
        var csv = System.Text.Encoding.UTF8.GetString(bytes);
        csv.Should().Contain("ZoneIndex,ZoneName");
        csv.Should().Contain("Zone 1");
        csv.Should().Contain("150");
        csv.Should().Contain("90");
    }

    [Fact]
    public async Task ExportVraMapCsv_NotFound_Throws()
    {
        var context = CreateDbContext();
        var exportHandler = new ExportVraMapCsvHandler(context);

        var act = () => exportHandler.Handle(new ExportVraMapCsvQuery(Guid.NewGuid()), CancellationToken.None);

        await act.Should().ThrowAsync<NotFoundException>();
    }
}
