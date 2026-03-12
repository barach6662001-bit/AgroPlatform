using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Economics.Commands.UpsertBudget;
using AgroPlatform.Application.Economics.Queries.GetBudgets;
using AgroPlatform.Domain.Economics;
using AgroPlatform.UnitTests.TestDoubles;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.UnitTests.Economics;

public class BudgetHandlerTests
{
    private static (IAppDbContext ctx, FakeCurrentUserService user) CreateContext()
    {
        var options = new DbContextOptionsBuilder<TestDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        var user = new FakeCurrentUserService();
        return (new TestDbContext(options), user);
    }

    // ── UpsertBudget ─────────────────────────────────────────────────────────

    [Fact]
    public async Task UpsertBudget_NewEntry_CreatesAndReturnsId()
    {
        var (ctx, user) = CreateContext();
        var handler = new UpsertBudgetHandler(ctx, user);
        var command = new UpsertBudgetCommand(2025, "Seeds", 50000m, null);

        var id = await handler.Handle(command, CancellationToken.None);

        id.Should().NotBeEmpty();
        var budget = await ((TestDbContext)ctx).Budgets.FindAsync(id);
        budget.Should().NotBeNull();
        budget!.Year.Should().Be(2025);
        budget.Category.Should().Be("Seeds");
        budget.PlannedAmount.Should().Be(50000m);
    }

    [Fact]
    public async Task UpsertBudget_ExistingEntry_UpdatesAmountAndReturnsId()
    {
        var (ctx, user) = CreateContext();
        var handler = new UpsertBudgetHandler(ctx, user);
        var command = new UpsertBudgetCommand(2025, "Fuel", 30000m, "Initial");

        var id1 = await handler.Handle(command, CancellationToken.None);

        var updateCommand = new UpsertBudgetCommand(2025, "Fuel", 45000m, "Updated");
        var id2 = await handler.Handle(updateCommand, CancellationToken.None);

        id2.Should().Be(id1);
        var budget = await ((TestDbContext)ctx).Budgets.FindAsync(id1);
        budget!.PlannedAmount.Should().Be(45000m);
        budget.Note.Should().Be("Updated");
        var count = await ((TestDbContext)ctx).Budgets.CountAsync();
        count.Should().Be(1);
    }

    // ── GetBudgets ───────────────────────────────────────────────────────────

    [Fact]
    public async Task GetBudgets_ByYear_ReturnsMatchingEntries()
    {
        var (ctx, _) = CreateContext();
        ctx.Budgets.Add(new Budget { Year = 2024, Category = "Seeds", PlannedAmount = 10000m });
        ctx.Budgets.Add(new Budget { Year = 2024, Category = "Fuel", PlannedAmount = 20000m });
        ctx.Budgets.Add(new Budget { Year = 2025, Category = "Seeds", PlannedAmount = 15000m });
        await ctx.SaveChangesAsync();

        var handler = new GetBudgetsHandler(ctx);
        var result = await handler.Handle(new GetBudgetsQuery(2024), CancellationToken.None);

        result.Should().HaveCount(2);
        result.Should().AllSatisfy(b => b.Year.Should().Be(2024));
    }
}
