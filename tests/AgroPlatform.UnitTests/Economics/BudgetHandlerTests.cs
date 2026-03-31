using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Economics.Commands.UpsertBudget;
using AgroPlatform.Application.Economics.Queries.ExportBudgets;
using AgroPlatform.Application.Economics.Queries.GetBudgets;
using AgroPlatform.Domain.Economics;
using AgroPlatform.Domain.Enums;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.UnitTests.Economics;

public class BudgetHandlerTests
{
    private sealed class TestCurrentUserService : ICurrentUserService
    {
        public string? UserId => null;
        public string? UserName => null;
        public Guid TenantId { get; } = Guid.NewGuid();
        public UserRole? Role => null;
        public bool IsInRole(UserRole role) => false;
        public bool IsSuperAdmin => false;
    }

    private static IAppDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<TestDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new TestDbContext(options);
    }

    // ── UpsertBudgetHandler ──────────────────────────────────────────────────

    [Fact]
    public async Task UpsertBudget_NewEntry_ReturnsNonEmptyGuid()
    {
        var context = CreateDbContext();
        var currentUser = new TestCurrentUserService();
        var handler = new UpsertBudgetHandler(context, currentUser);
        var command = new UpsertBudgetCommand(2024, "Seeds", 10000m, null);

        var id = await handler.Handle(command, CancellationToken.None);

        id.Should().NotBeEmpty();
    }

    [Fact]
    public async Task UpsertBudget_NewEntry_PersistsBudgetInDatabase()
    {
        var context = CreateDbContext();
        var currentUser = new TestCurrentUserService();
        var handler = new UpsertBudgetHandler(context, currentUser);
        var command = new UpsertBudgetCommand(2024, "Fuel", 5000m, "Fuel note");

        var id = await handler.Handle(command, CancellationToken.None);

        var budget = await ((TestDbContext)context).Budgets.FindAsync(id);
        budget.Should().NotBeNull();
        budget!.Year.Should().Be(2024);
        budget.Category.Should().Be("Fuel");
        budget.PlannedAmount.Should().Be(5000m);
        budget.Note.Should().Be("Fuel note");
    }

    [Fact]
    public async Task UpsertBudget_ExistingYearAndCategory_UpdatesExistingRecord()
    {
        var context = CreateDbContext();
        var currentUser = new TestCurrentUserService();
        var handler = new UpsertBudgetHandler(context, currentUser);

        var firstId = await handler.Handle(new UpsertBudgetCommand(2024, "Seeds", 10000m, null), CancellationToken.None);
        var secondId = await handler.Handle(new UpsertBudgetCommand(2024, "Seeds", 15000m, "Updated"), CancellationToken.None);

        firstId.Should().Be(secondId);
        var count = await ((TestDbContext)context).Budgets.CountAsync();
        count.Should().Be(1);

        var budget = await ((TestDbContext)context).Budgets.FindAsync(firstId);
        budget!.PlannedAmount.Should().Be(15000m);
        budget.Note.Should().Be("Updated");
    }

    // ── GetBudgetsHandler ────────────────────────────────────────────────────

    [Fact]
    public async Task GetBudgets_EmptyDatabase_ReturnsEmptyList()
    {
        var context = CreateDbContext();
        var handler = new GetBudgetsHandler(context);

        var result = await handler.Handle(new GetBudgetsQuery(2024), CancellationToken.None);

        result.Should().BeEmpty();
    }

    [Fact]
    public async Task GetBudgets_FiltersByYearCorrectly()
    {
        var context = CreateDbContext();
        var currentUser = new TestCurrentUserService();
        context.Budgets.Add(new Budget { TenantId = currentUser.TenantId, Year = 2023, Category = "Seeds", PlannedAmount = 5000m });
        context.Budgets.Add(new Budget { TenantId = currentUser.TenantId, Year = 2024, Category = "Fuel", PlannedAmount = 8000m });
        context.Budgets.Add(new Budget { TenantId = currentUser.TenantId, Year = 2024, Category = "Seeds", PlannedAmount = 10000m });
        await context.SaveChangesAsync();

        var handler = new GetBudgetsHandler(context);
        var result = await handler.Handle(new GetBudgetsQuery(2024), CancellationToken.None);

        result.Should().HaveCount(2);
        result.Should().OnlyContain(b => b.Year == 2024);
    }

    [Fact]
    public async Task GetBudgets_ReturnsCorrectDtos()
    {
        var context = CreateDbContext();
        var currentUser = new TestCurrentUserService();
        context.Budgets.Add(new Budget { TenantId = currentUser.TenantId, Year = 2024, Category = "Labor", PlannedAmount = 12000m, Note = "labor note" });
        await context.SaveChangesAsync();

        var handler = new GetBudgetsHandler(context);
        var result = await handler.Handle(new GetBudgetsQuery(2024), CancellationToken.None);

        result.Should().HaveCount(1);
        result[0].Category.Should().Be("Labor");
        result[0].PlannedAmount.Should().Be(12000m);
        result[0].Note.Should().Be("labor note");
    }

    [Fact]
    public async Task GetBudgets_ExcludesSoftDeletedRecords()
    {
        var context = CreateDbContext();
        var currentUser = new TestCurrentUserService();
        context.Budgets.Add(new Budget { TenantId = currentUser.TenantId, Year = 2024, Category = "Seeds", PlannedAmount = 5000m, IsDeleted = false });
        context.Budgets.Add(new Budget { TenantId = currentUser.TenantId, Year = 2024, Category = "Fuel", PlannedAmount = 8000m, IsDeleted = true });
        await context.SaveChangesAsync();

        var handler = new GetBudgetsHandler(context);
        var result = await handler.Handle(new GetBudgetsQuery(2024), CancellationToken.None);

        result.Should().HaveCount(1);
        result[0].Category.Should().Be("Seeds");
    }

    // ── ExportBudgetsHandler ─────────────────────────────────────────────────

    [Fact]
    public async Task ExportBudgets_ReturnsCsvWithCorrectContentType()
    {
        var context = CreateDbContext();
        var currentUser = new TestCurrentUserService();
        context.Budgets.Add(new Budget { TenantId = currentUser.TenantId, Year = 2024, Category = "Seeds", PlannedAmount = 10000m });
        await context.SaveChangesAsync();

        var handler = new ExportBudgetsHandler(context);
        var result = await handler.Handle(new ExportBudgetsQuery(2024), CancellationToken.None);

        result.ContentType.Should().Be("text/csv");
        result.Content.Should().NotBeEmpty();
        result.FileName.Should().Contain("budgets-2024");
    }

    [Fact]
    public async Task ExportBudgets_ContentContainsCsvHeaderAndData()
    {
        var context = CreateDbContext();
        var currentUser = new TestCurrentUserService();
        context.Budgets.Add(new Budget { TenantId = currentUser.TenantId, Year = 2024, Category = "Fuel", PlannedAmount = 5000m, Note = "test" });
        await context.SaveChangesAsync();

        var handler = new ExportBudgetsHandler(context);
        var result = await handler.Handle(new ExportBudgetsQuery(2024), CancellationToken.None);

        var content = System.Text.Encoding.UTF8.GetString(result.Content).TrimStart('\ufeff');
        content.Should().Contain("Year,Category,PlannedAmount,Note");
        content.Should().Contain("Fuel");
        content.Should().Contain("5000");
    }
}
