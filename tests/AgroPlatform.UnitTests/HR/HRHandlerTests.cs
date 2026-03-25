using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.HR.Commands.CreateEmployee;
using AgroPlatform.Application.HR.Commands.CreateSalaryPayment;
using AgroPlatform.Application.HR.Commands.CreateWorkLog;
using AgroPlatform.Domain.HR;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.UnitTests.HR;

public class HRHandlerTests
{
    private static IAppDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<TestDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new TestDbContext(options);
    }

    // ── CreateEmployee ────────────────────────────────────────────────────

    [Fact]
    public async Task CreateEmployee_ValidCommand_ReturnsNonEmptyGuid()
    {
        var context = CreateDbContext();
        var handler = new CreateEmployeeHandler(context);
        var command = new CreateEmployeeCommand("John", "Doe", "Driver", "Hourly", 150m, null, null);

        var id = await handler.Handle(command, CancellationToken.None);

        id.Should().NotBeEmpty();
    }

    [Fact]
    public async Task CreateEmployee_ValidCommand_PersistsEmployeeInDatabase()
    {
        var context = CreateDbContext();
        var handler = new CreateEmployeeHandler(context);
        var command = new CreateEmployeeCommand("Jane", "Smith", "Agronomist", "Piecework", null, 200m, "Test notes");

        var id = await handler.Handle(command, CancellationToken.None);

        var employee = await ((TestDbContext)context).Employees.FindAsync(id);
        employee.Should().NotBeNull();
        employee!.FirstName.Should().Be("Jane");
        employee.LastName.Should().Be("Smith");
        employee.Position.Should().Be("Agronomist");
        employee.SalaryType.Should().Be("Piecework");
        employee.PieceworkRate.Should().Be(200m);
        employee.Notes.Should().Be("Test notes");
    }

    [Fact]
    public async Task CreateEmployee_IsActive_DefaultsToTrue()
    {
        var context = CreateDbContext();
        var handler = new CreateEmployeeHandler(context);
        var command = new CreateEmployeeCommand("Ivan", "Petrov", null, "Hourly", 100m, null, null);

        var id = await handler.Handle(command, CancellationToken.None);

        var employee = await ((TestDbContext)context).Employees.FindAsync(id);
        employee!.IsActive.Should().BeTrue();
    }

    // ── CreateWorkLog ─────────────────────────────────────────────────────

    [Fact]
    public async Task CreateWorkLog_HourlyEmployee_CalculatesAccruedAmount()
    {
        var context = CreateDbContext();
        var employee = new Employee
        {
            FirstName = "Test",
            LastName = "Worker",
            SalaryType = "Hourly",
            HourlyRate = 100m,
            IsActive = true,
        };
        context.Employees.Add(employee);
        await context.SaveChangesAsync();

        var handler = new CreateWorkLogHandler(context);
        var command = new CreateWorkLogCommand(employee.Id, DateTime.Today, 8m, null, "Plowing", null, null);

        var id = await handler.Handle(command, CancellationToken.None);

        var workLog = await ((TestDbContext)context).WorkLogs.FindAsync(id);
        workLog!.AccruedAmount.Should().Be(800m); // 8h × 100 UAH/h
        workLog.IsPaid.Should().BeFalse();
    }

    [Fact]
    public async Task CreateWorkLog_PieceworkEmployee_CalculatesAccruedAmount()
    {
        var context = CreateDbContext();
        var employee = new Employee
        {
            FirstName = "Test",
            LastName = "Picker",
            SalaryType = "Piecework",
            PieceworkRate = 5m,
            IsActive = true,
        };
        context.Employees.Add(employee);
        await context.SaveChangesAsync();

        var handler = new CreateWorkLogHandler(context);
        var command = new CreateWorkLogCommand(employee.Id, DateTime.Today, null, 100m, "Harvesting", null, null);

        var id = await handler.Handle(command, CancellationToken.None);

        var workLog = await ((TestDbContext)context).WorkLogs.FindAsync(id);
        workLog!.AccruedAmount.Should().Be(500m); // 100 units × 5 UAH/unit
        workLog.IsPaid.Should().BeFalse();
    }

    [Fact]
    public async Task CreateWorkLog_NonExistentEmployee_ThrowsNotFoundException()
    {
        var context = CreateDbContext();
        var handler = new CreateWorkLogHandler(context);
        var command = new CreateWorkLogCommand(Guid.NewGuid(), DateTime.Today, 8m, null, null, null, null);

        var act = async () => await handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<NotFoundException>();
    }

    // ── CreateSalaryPayment ───────────────────────────────────────────────

    [Fact]
    public async Task CreateSalaryPayment_ValidCommand_CreatesSalaryPaymentAndCostRecord()
    {
        var context = CreateDbContext();
        var employee = new Employee
        {
            FirstName = "Test",
            LastName = "Employee",
            SalaryType = "Hourly",
            IsActive = true,
        };
        context.Employees.Add(employee);
        await context.SaveChangesAsync();

        var handler = new CreateSalaryPaymentHandler(context);
        var command = new CreateSalaryPaymentCommand(employee.Id, 5000m, DateTime.Today, "Salary", null);

        var id = await handler.Handle(command, CancellationToken.None);

        var payment = await ((TestDbContext)context).SalaryPayments.FindAsync(id);
        payment.Should().NotBeNull();
        payment!.Amount.Should().Be(5000m);
        payment.PaymentType.Should().Be("Salary");

        var costRecord = await ((TestDbContext)context).CostRecords
            .FirstOrDefaultAsync(c => c.Category == "Salary");
        costRecord.Should().NotBeNull();
        costRecord!.Amount.Should().Be(5000m);
        costRecord.Currency.Should().Be("UAH");
    }

    [Fact]
    public async Task CreateSalaryPayment_NonExistentEmployee_ThrowsNotFoundException()
    {
        var context = CreateDbContext();
        var handler = new CreateSalaryPaymentHandler(context);
        var command = new CreateSalaryPaymentCommand(Guid.NewGuid(), 1000m, DateTime.Today, "Salary", null);

        var act = async () => await handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<NotFoundException>();
    }
}
