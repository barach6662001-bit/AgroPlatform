using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Fields.Commands.AssignCrop;
using AgroPlatform.Application.Fields.Commands.CreateField;
using AgroPlatform.Application.Fields.Commands.DeleteField;
using AgroPlatform.Application.Fields.Commands.DeleteRotationPlan;
using AgroPlatform.Application.Fields.Commands.PlanRotation;
using AgroPlatform.Application.Fields.Commands.UpdateField;
using AgroPlatform.Application.Fields.Commands.UpdateYield;
using AgroPlatform.Application.Fields.Queries.GetFields;
using AgroPlatform.Domain.Enums;
using AgroPlatform.Domain.Fields;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.UnitTests.Fields;

public class FieldHandlerTests
{
    private static IAppDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<TestDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new TestDbContext(options);
    }

    // ── CreateField ─────────────────────────────────────────────────────────

    [Fact]
    public async Task CreateField_ValidCommand_ReturnsNewId()
    {
        var context = CreateDbContext();
        var handler = new CreateFieldHandler(context);
        var command = new CreateFieldCommand("North Field", null, 50.5m, null, null, null, "Clay", null);

        var id = await handler.Handle(command, CancellationToken.None);

        id.Should().NotBeEmpty();
        var field = await ((TestDbContext)context).Fields.FindAsync(id);
        field.Should().NotBeNull();
        field!.Name.Should().Be("North Field");
        field.AreaHectares.Should().Be(50.5m);
    }

    // ── UpdateField ─────────────────────────────────────────────────────────

    [Fact]
    public async Task UpdateField_ExistingField_UpdatesProperties()
    {
        var context = CreateDbContext();
        var field = new Field { Name = "Old Name", AreaHectares = 10m };
        context.Fields.Add(field);
        await context.SaveChangesAsync();

        var handler = new UpdateFieldHandler(context);
        var command = new UpdateFieldCommand(field.Id, "New Name", null, 20m, null, null, null, "Sandy", null);

        await handler.Handle(command, CancellationToken.None);

        var updated = await ((TestDbContext)context).Fields.FindAsync(field.Id);
        updated!.Name.Should().Be("New Name");
        updated.AreaHectares.Should().Be(20m);
        updated.SoilType.Should().Be("Sandy");
    }

    [Fact]
    public async Task UpdateField_NotFound_ThrowsNotFoundException()
    {
        var context = CreateDbContext();
        var handler = new UpdateFieldHandler(context);
        var command = new UpdateFieldCommand(Guid.NewGuid(), "Name", null, 10m, null, null, null, null, null);

        var act = () => handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<NotFoundException>();
    }

    // ── DeleteField ─────────────────────────────────────────────────────────

    [Fact]
    public async Task DeleteField_ExistingField_RemovesIt()
    {
        var context = CreateDbContext();
        var field = new Field { Name = "Field To Delete", AreaHectares = 5m };
        context.Fields.Add(field);
        await context.SaveChangesAsync();

        var handler = new DeleteFieldHandler(context);
        await handler.Handle(new DeleteFieldCommand(field.Id), CancellationToken.None);

        var found = await ((TestDbContext)context).Fields.FindAsync(field.Id);
        found.Should().BeNull();
    }

    [Fact]
    public async Task DeleteField_NotFound_ThrowsNotFoundException()
    {
        var context = CreateDbContext();
        var handler = new DeleteFieldHandler(context);

        var act = () => handler.Handle(new DeleteFieldCommand(Guid.NewGuid()), CancellationToken.None);

        await act.Should().ThrowAsync<NotFoundException>();
    }

    // ── AssignCrop ──────────────────────────────────────────────────────────

    [Fact]
    public async Task AssignCrop_NewYear_CreatesCropHistoryAndUpdatesField()
    {
        var context = CreateDbContext();
        var field = new Field { Name = "Test Field", AreaHectares = 100m };
        context.Fields.Add(field);
        await context.SaveChangesAsync();

        var handler = new AssignCropHandler(context);
        var command = new AssignCropCommand(field.Id, CropType.Wheat, 2024, 5.5m, null);

        var historyId = await handler.Handle(command, CancellationToken.None);

        historyId.Should().NotBeEmpty();
        var history = await ((TestDbContext)context).FieldCropHistories.FindAsync(historyId);
        history.Should().NotBeNull();
        history!.Crop.Should().Be(CropType.Wheat);
        history.Year.Should().Be(2024);

        var updatedField = await ((TestDbContext)context).Fields.FindAsync(field.Id);
        updatedField!.CurrentCrop.Should().Be(CropType.Wheat);
        updatedField.CurrentCropYear.Should().Be(2024);
    }

    [Fact]
    public async Task AssignCrop_DuplicateYear_ThrowsConflictException()
    {
        var context = CreateDbContext();
        var field = new Field { Name = "Test Field", AreaHectares = 100m };
        context.Fields.Add(field);
        await context.SaveChangesAsync();

        var handler = new AssignCropHandler(context);
        await handler.Handle(new AssignCropCommand(field.Id, CropType.Wheat, 2024, null, null), CancellationToken.None);

        var act = () => handler.Handle(new AssignCropCommand(field.Id, CropType.Barley, 2024, null, null), CancellationToken.None);

        await act.Should().ThrowAsync<ConflictException>();
    }

    [Fact]
    public async Task AssignCrop_FieldNotFound_ThrowsNotFoundException()
    {
        var context = CreateDbContext();
        var handler = new AssignCropHandler(context);
        var command = new AssignCropCommand(Guid.NewGuid(), CropType.Wheat, 2024, null, null);

        var act = () => handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task AssignCrop_OlderYear_DoesNotOverrideCurrentCrop()
    {
        var context = CreateDbContext();
        var field = new Field { Name = "Test Field", AreaHectares = 100m, CurrentCropYear = 2024, CurrentCrop = CropType.Corn };
        context.Fields.Add(field);
        await context.SaveChangesAsync();

        var handler = new AssignCropHandler(context);
        await handler.Handle(new AssignCropCommand(field.Id, CropType.Wheat, 2022, null, null), CancellationToken.None);

        var updatedField = await ((TestDbContext)context).Fields.FindAsync(field.Id);
        updatedField!.CurrentCrop.Should().Be(CropType.Corn);
        updatedField.CurrentCropYear.Should().Be(2024);
    }

    // ── UpdateYield ─────────────────────────────────────────────────────────

    [Fact]
    public async Task UpdateYield_ExistingHistory_UpdatesYield()
    {
        var context = CreateDbContext();
        var field = new Field { Name = "Field", AreaHectares = 50m };
        context.Fields.Add(field);
        var history = new FieldCropHistory { FieldId = field.Id, Crop = CropType.Wheat, Year = 2024 };
        context.FieldCropHistories.Add(history);
        await context.SaveChangesAsync();

        var handler = new UpdateYieldHandler(context);
        await handler.Handle(new UpdateYieldCommand(history.Id, 6.2m), CancellationToken.None);

        var updated = await ((TestDbContext)context).FieldCropHistories.FindAsync(history.Id);
        updated!.YieldPerHectare.Should().Be(6.2m);
    }

    [Fact]
    public async Task UpdateYield_NotFound_ThrowsNotFoundException()
    {
        var context = CreateDbContext();
        var handler = new UpdateYieldHandler(context);

        var act = () => handler.Handle(new UpdateYieldCommand(Guid.NewGuid(), 5m), CancellationToken.None);

        await act.Should().ThrowAsync<NotFoundException>();
    }

    // ── PlanRotation ────────────────────────────────────────────────────────

    [Fact]
    public async Task PlanRotation_NewPlan_CreatesRecord()
    {
        var context = CreateDbContext();
        var field = new Field { Name = "Field", AreaHectares = 50m };
        context.Fields.Add(field);
        await context.SaveChangesAsync();

        var handler = new PlanRotationHandler(context);
        var id = await handler.Handle(new PlanRotationCommand(field.Id, 2025, CropType.Sunflower, null), CancellationToken.None);

        id.Should().NotBeEmpty();
        var plan = await ((TestDbContext)context).CropRotationPlans.FindAsync(id);
        plan.Should().NotBeNull();
        plan!.PlannedCrop.Should().Be(CropType.Sunflower);
    }

    [Fact]
    public async Task PlanRotation_ExistingPlan_UpdatesRecord()
    {
        var context = CreateDbContext();
        var field = new Field { Name = "Field", AreaHectares = 50m };
        context.Fields.Add(field);
        var plan = new CropRotationPlan { FieldId = field.Id, Year = 2025, PlannedCrop = CropType.Barley };
        context.CropRotationPlans.Add(plan);
        await context.SaveChangesAsync();

        var handler = new PlanRotationHandler(context);
        var returnedId = await handler.Handle(new PlanRotationCommand(field.Id, 2025, CropType.Corn, "Updated"), CancellationToken.None);

        returnedId.Should().Be(plan.Id);
        var updated = await ((TestDbContext)context).CropRotationPlans.FindAsync(plan.Id);
        updated!.PlannedCrop.Should().Be(CropType.Corn);
        updated.Notes.Should().Be("Updated");
    }

    [Fact]
    public async Task PlanRotation_FieldNotFound_ThrowsNotFoundException()
    {
        var context = CreateDbContext();
        var handler = new PlanRotationHandler(context);

        var act = () => handler.Handle(new PlanRotationCommand(Guid.NewGuid(), 2025, CropType.Wheat, null), CancellationToken.None);

        await act.Should().ThrowAsync<NotFoundException>();
    }

    // ── DeleteRotationPlan ──────────────────────────────────────────────────

    [Fact]
    public async Task DeleteRotationPlan_ExistingPlan_RemovesIt()
    {
        var context = CreateDbContext();
        var field = new Field { Name = "Field", AreaHectares = 50m };
        context.Fields.Add(field);
        var plan = new CropRotationPlan { FieldId = field.Id, Year = 2025, PlannedCrop = CropType.Barley };
        context.CropRotationPlans.Add(plan);
        await context.SaveChangesAsync();

        var handler = new DeleteRotationPlanHandler(context);
        await handler.Handle(new DeleteRotationPlanCommand(plan.Id), CancellationToken.None);

        var found = await ((TestDbContext)context).CropRotationPlans.FindAsync(plan.Id);
        found.Should().BeNull();
    }

    [Fact]
    public async Task DeleteRotationPlan_NotFound_ThrowsNotFoundException()
    {
        var context = CreateDbContext();
        var handler = new DeleteRotationPlanHandler(context);

        var act = () => handler.Handle(new DeleteRotationPlanCommand(Guid.NewGuid()), CancellationToken.None);

        await act.Should().ThrowAsync<NotFoundException>();
    }

    // ── GetFields ───────────────────────────────────────────────────────────

    [Fact]
    public async Task GetFields_NoFilter_ReturnsAllFields()
    {
        var context = CreateDbContext();
        context.Fields.Add(new Field { Name = "Field A", AreaHectares = 10m });
        context.Fields.Add(new Field { Name = "Field B", AreaHectares = 20m });
        await context.SaveChangesAsync();

        var handler = new GetFieldsHandler(context);
        var result = await handler.Handle(new GetFieldsQuery(null, null), CancellationToken.None);

        result.Should().HaveCount(2);
    }

    [Fact]
    public async Task GetFields_FilterByCrop_ReturnsMatchingFields()
    {
        var context = CreateDbContext();
        context.Fields.Add(new Field { Name = "Wheat Field", AreaHectares = 10m, CurrentCrop = CropType.Wheat });
        context.Fields.Add(new Field { Name = "Corn Field", AreaHectares = 20m, CurrentCrop = CropType.Corn });
        await context.SaveChangesAsync();

        var handler = new GetFieldsHandler(context);
        var result = await handler.Handle(new GetFieldsQuery(CropType.Wheat, null), CancellationToken.None);

        result.Should().HaveCount(1);
        result[0].Name.Should().Be("Wheat Field");
    }

    [Fact]
    public async Task GetFields_SearchTerm_ReturnsMatchingFields()
    {
        var context = CreateDbContext();
        context.Fields.Add(new Field { Name = "North Wheat", AreaHectares = 10m });
        context.Fields.Add(new Field { Name = "South Corn", AreaHectares = 20m });
        await context.SaveChangesAsync();

        var handler = new GetFieldsHandler(context);
        var result = await handler.Handle(new GetFieldsQuery(null, "north"), CancellationToken.None);

        result.Should().HaveCount(1);
        result[0].Name.Should().Be("North Wheat");
    }
}
