using AgroPlatform.Application.Economics.Commands.UpsertBudget;
using AgroPlatform.Application.Economics.Queries.ExportBudgets;
using AgroPlatform.Application.Economics.Queries.GetBudgetPlanVsFact;
using AgroPlatform.Application.Economics.Queries.GetBudgets;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgroPlatform.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/economics/budgets")]
[Produces("application/json")]
public class BudgetsController : ControllerBase
{
    private readonly ISender _sender;

    public BudgetsController(ISender sender)
    {
        _sender = sender;
    }

    /// <summary>Returns planned budget entries for the specified year.</summary>
    [HttpGet]
    public async Task<IActionResult> GetBudgets([FromQuery] int year, CancellationToken cancellationToken)
    {
        if (year == 0) year = DateTime.UtcNow.Year;
        var result = await _sender.Send(new GetBudgetsQuery(year), cancellationToken);
        return Ok(result);
    }

    /// <summary>Returns plan-vs-fact comparison for the specified year.</summary>
    [HttpGet("plan-vs-fact")]
    public async Task<IActionResult> GetBudgetPlanVsFact([FromQuery] int year, CancellationToken cancellationToken)
    {
        if (year == 0) year = DateTime.UtcNow.Year;
        var result = await _sender.Send(new GetBudgetPlanVsFactQuery(year), cancellationToken);
        return Ok(result);
    }

    /// <summary>Creates or updates a budget entry for a given year + category pair.</summary>
    [HttpPut]
    [Authorize(Roles = "Administrator,Manager,Director")]
    public async Task<IActionResult> UpsertBudget([FromBody] UpsertBudgetCommand command, CancellationToken cancellationToken)
    {
        var id = await _sender.Send(command, cancellationToken);
        return Ok(new { id });
    }

    /// <summary>Exports budget entries for the specified year as a CSV file.</summary>
    [HttpGet("export")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> ExportBudgets([FromQuery] int year, CancellationToken cancellationToken)
    {
        if (year == 0) year = DateTime.UtcNow.Year;
        var result = await _sender.Send(new ExportBudgetsQuery(year), cancellationToken);
        return File(result.Content, result.ContentType, result.FileName);
    }
}
