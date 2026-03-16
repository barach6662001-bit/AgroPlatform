using AgroPlatform.Application.HR.Commands.CreateEmployee;
using AgroPlatform.Application.HR.Commands.CreateSalaryPayment;
using AgroPlatform.Application.HR.Commands.CreateWorkLog;
using AgroPlatform.Application.HR.Queries.GetEmployees;
using AgroPlatform.Application.HR.Queries.GetSalarySummary;
using AgroPlatform.Application.HR.Queries.GetWorkLogs;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgroPlatform.Api.Controllers;

[ApiController]
[Authorize]
[Route("api")]
[Produces("application/json")]
public class HrController : ControllerBase
{
    private readonly ISender _sender;

    public HrController(ISender sender)
    {
        _sender = sender;
    }

    // ── Employees ──────────────────────────────────────────────────────────

    [HttpGet("employees")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetEmployees(
        [FromQuery] bool? activeOnly,
        CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetEmployeesQuery(activeOnly), cancellationToken);
        return Ok(result);
    }

    [HttpPost("employees")]
    [Authorize(Roles = "Administrator,Manager")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateEmployee(
        [FromBody] CreateEmployeeCommand command,
        CancellationToken cancellationToken)
    {
        var result = await _sender.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetEmployees), new { }, result);
    }

    // ── Work Logs ──────────────────────────────────────────────────────────

    [HttpGet("worklogs")]
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

    [HttpPost("worklogs")]
    [Authorize(Roles = "Administrator,Manager,Agronomist")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateWorkLog(
        [FromBody] CreateWorkLogCommand command,
        CancellationToken cancellationToken)
    {
        var result = await _sender.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetWorkLogs), new { }, result);
    }

    // ── Salary Payments ────────────────────────────────────────────────────

    [HttpPost("salary-payments")]
    [Authorize(Roles = "Administrator,Manager,Director")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateSalaryPayment(
        [FromBody] CreateSalaryPaymentCommand command,
        CancellationToken cancellationToken)
    {
        var result = await _sender.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetSalarySummary), new { }, result);
    }

    // ── Salary Summary ─────────────────────────────────────────────────────

    [HttpGet("salary-summary")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSalarySummary(
        [FromQuery] int? month,
        [FromQuery] int? year,
        CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        var result = await _sender.Send(
            new GetSalarySummaryQuery(month ?? now.Month, year ?? now.Year),
            cancellationToken);
        return Ok(result);
    }
}
