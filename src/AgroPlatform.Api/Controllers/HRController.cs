using AgroPlatform.Application.HR.Commands.CreateEmployee;
using AgroPlatform.Application.HR.Commands.CreateSalaryPayment;
using AgroPlatform.Application.HR.Commands.CreateWorkLog;
using AgroPlatform.Application.HR.Commands.DeleteEmployee;
using AgroPlatform.Application.HR.Commands.UpdateEmployee;
using AgroPlatform.Application.HR.Queries.GetEmployees;
using AgroPlatform.Application.HR.Queries.GetSalarySummary;
using AgroPlatform.Application.HR.Queries.GetWorkLogs;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgroPlatform.Api.Controllers;

/// <summary>
/// Manages employees, work logs (timesheet), and salary payments.
/// </summary>
[ApiController]
[Authorize]
[Produces("application/json")]
public class HRController : ControllerBase
{
    private readonly ISender _sender;

    /// <summary>Initializes a new instance of <see cref="HRController"/>.</summary>
    public HRController(ISender sender)
    {
        _sender = sender;
    }

    // ── Employees ──────────────────────────────────────────────────────────

    /// <summary>Returns the list of employees.</summary>
    /// <param name="activeOnly">When true, only active employees are returned.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    [HttpGet("api/employees")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetEmployees([FromQuery] bool? activeOnly, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetEmployeesQuery(activeOnly), cancellationToken);
        return Ok(result);
    }

    /// <summary>Creates a new employee.</summary>
    /// <param name="command">Employee data.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The ID of the created employee.</returns>
    [HttpPost("api/employees")]
    [Authorize(Roles = "Administrator,Manager")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateEmployee([FromBody] CreateEmployeeCommand command, CancellationToken cancellationToken)
    {
        var id = await _sender.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetEmployees), new { }, new { id });
    }

    /// <summary>Updates an existing employee.</summary>
    /// <param name="id">Employee ID.</param>
    /// <param name="command">Updated employee data.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    [HttpPut("api/employees/{id}")]
    [Authorize(Roles = "Administrator,Manager")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateEmployee(Guid id, [FromBody] UpdateEmployeeCommand command, CancellationToken cancellationToken)
    {
        await _sender.Send(command with { Id = id }, cancellationToken);
        return NoContent();
    }

    /// <summary>Deletes (soft-deletes) an employee.</summary>
    /// <param name="id">Employee ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    [HttpDelete("api/employees/{id}")]
    [Authorize(Roles = "Administrator,Manager")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteEmployee(Guid id, CancellationToken cancellationToken)
    {
        await _sender.Send(new DeleteEmployeeCommand(id), cancellationToken);
        return NoContent();
    }

    // ── Work Logs ──────────────────────────────────────────────────────────

    /// <summary>Returns work logs, optionally filtered by employee, month and year.</summary>
    /// <param name="employeeId">Optional employee ID filter.</param>
    /// <param name="month">Optional month filter (1–12).</param>
    /// <param name="year">Optional year filter.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    [HttpGet("api/worklogs")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetWorkLogs(
        [FromQuery] Guid? employeeId,
        [FromQuery] int? month,
        [FromQuery] int? year,
        CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetWorkLogsQuery(employeeId, month, year), cancellationToken);
        return Ok(result);
    }

    /// <summary>Creates a work log entry (timesheet record).</summary>
    /// <param name="command">Work log data.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The ID of the created work log.</returns>
    [HttpPost("api/worklogs")]
    [Authorize(Roles = "Administrator,Manager")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CreateWorkLog([FromBody] CreateWorkLogCommand command, CancellationToken cancellationToken)
    {
        var id = await _sender.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetWorkLogs), new { }, new { id });
    }

    // ── Salary Payments ────────────────────────────────────────────────────

    /// <summary>Records a salary payment (also creates a cost record).</summary>
    /// <param name="request">Payment data.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The ID of the created payment.</returns>
    [HttpPost("api/salary-payments")]
    [Authorize(Roles = "Administrator,Manager")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CreateSalaryPayment([FromBody] CreateSalaryPaymentCommand request, CancellationToken cancellationToken)
    {
        var id = await _sender.Send(request, cancellationToken);
        return CreatedAtAction(nameof(GetSalarySummary), new { }, new { id });
    }

    // ── Salary Summary ─────────────────────────────────────────────────────

    /// <summary>Returns accrual/payment summary for a given month and year.</summary>
    /// <param name="month">Month (1–12).</param>
    /// <param name="year">Year.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    [HttpGet("api/salary-summary")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSalarySummary([FromQuery] int month, [FromQuery] int year, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetSalarySummaryQuery(month, year), cancellationToken);
        return Ok(result);
    }
}
