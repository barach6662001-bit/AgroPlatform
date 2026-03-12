using AgroPlatform.Application.Economics.Commands.CreateCostRecord;
using AgroPlatform.Application.Economics.Commands.DeleteCostRecord;
using AgroPlatform.Application.Economics.DTOs;
using AgroPlatform.Application.Economics.Queries.GetCostRecords;
using AgroPlatform.Application.Economics.Queries.GetCostSummary;
using AgroPlatform.Application.Economics.Queries.GetFieldPnl;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgroPlatform.Api.Controllers;

/// <summary>
/// Manages cost records — tracks farm expenses by category, field and agro-operation.
/// </summary>
[ApiController]
[Authorize]
[Route("api/economics")]
[Produces("application/json")]
public class EconomicsController : ControllerBase
{
    private readonly ISender _sender;

    /// <summary>Initializes a new instance of <see cref="EconomicsController"/>.</summary>
    public EconomicsController(ISender sender)
    {
        _sender = sender;
    }

    /// <summary>Records a new cost entry.</summary>
    /// <param name="command">Cost record data (amount, category, optional field and operation).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The ID of the created cost record.</returns>
    [HttpPost("cost-records")]
    [Authorize(Roles = "Administrator,Manager,Director")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateCostRecord([FromBody] CreateCostRecordCommand command, CancellationToken cancellationToken)
    {
        var id = await _sender.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetCostRecords), new { }, new { id });
    }

    /// <summary>
    /// Returns a paginated list of cost records filtered by category, field, operation and/or date range.
    /// </summary>
    /// <param name="category">Optional category filter.</param>
    /// <param name="fieldId">Optional field filter.</param>
    /// <param name="agroOperationId">Optional agro-operation filter.</param>
    /// <param name="dateFrom">Start of the date range (inclusive).</param>
    /// <param name="dateTo">End of the date range (inclusive).</param>
    /// <param name="page">Page number (1-based, default 1).</param>
    /// <param name="pageSize">Page size (default 20).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    [HttpGet("cost-records")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCostRecords(
        [FromQuery] string? category,
        [FromQuery] Guid? fieldId,
        [FromQuery] Guid? agroOperationId,
        [FromQuery] DateTime? dateFrom,
        [FromQuery] DateTime? dateTo,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var result = await _sender.Send(new GetCostRecordsQuery(category, fieldId, agroOperationId, dateFrom, dateTo, page, pageSize), cancellationToken);
        return Ok(result);
    }

    /// <summary>Returns aggregated cost totals grouped by category.</summary>
    [HttpGet("cost-summary")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCostSummary(
        [FromQuery] string? category,
        [FromQuery] DateTime? dateFrom,
        [FromQuery] DateTime? dateTo,
        CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetCostSummaryQuery(category, dateFrom, dateTo), cancellationToken);
        return Ok(result);
    }

    /// <summary>Deletes a cost record.</summary>
    /// <param name="id">Cost record ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    [HttpDelete("cost-records/{id:guid}")]
    [Authorize(Roles = "Administrator,Manager,Director")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteCostRecord(Guid id, CancellationToken cancellationToken)
    {
        await _sender.Send(new DeleteCostRecordCommand(id), cancellationToken);
        return NoContent();
    }

    /// <summary>
    /// Returns Profit &amp; Loss analytics per field for the given year.
    /// Costs are taken from CostRecord entries linked to each field.
    /// Revenue estimation requires <paramref name="estimatedPricePerTonne"/> and recorded yield data.
    /// </summary>
    /// <param name="year">Calendar year (default: current year).</param>
    /// <param name="estimatedPricePerTonne">Optional price per tonne (UAH) for revenue estimation.</param>
    /// <param name="fieldId">Optional field filter — returns data for one field only.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of <see cref="FieldPnlDto"/> sorted by field name.</returns>
    [HttpGet("field-pnl")]
    [ProducesResponseType(typeof(IReadOnlyList<FieldPnlDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetFieldPnl(
        [FromQuery] int? year,
        [FromQuery] decimal? estimatedPricePerTonne,
        [FromQuery] Guid? fieldId,
        CancellationToken cancellationToken)
    {
        var result = await _sender.Send(
            new GetFieldPnlQuery(year, estimatedPricePerTonne, fieldId),
            cancellationToken);
        return Ok(result);
    }
}
