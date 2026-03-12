using AgroPlatform.Application.Economics.Commands.CreateCostRecord;
using AgroPlatform.Application.Economics.Commands.DeleteCostRecord;
using AgroPlatform.Application.Economics.DTOs;
using AgroPlatform.Application.Economics.Queries.ExportCostRecords;
using AgroPlatform.Application.Economics.Queries.GetCostRecords;
using AgroPlatform.Application.Economics.Queries.GetCostSummary;
using AgroPlatform.Application.Economics.Queries.GetFieldPnl;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgroPlatform.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/economics")]
[Produces("application/json")]
public class EconomicsController : ControllerBase
{
    private readonly ISender _sender;

    public EconomicsController(ISender sender)
    {
        _sender = sender;
    }

    [HttpPost("cost-records")]
    [Authorize(Roles = "Administrator,Manager,Director")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateCostRecord([FromBody] CreateCostRecordCommand command, CancellationToken cancellationToken)
    {
        var id = await _sender.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetCostRecords), new { }, new { id });
    }

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

    /// <summary>Exports cost records as CSV file.</summary>
    [HttpGet("cost-records/export")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> ExportCostRecords(
        [FromQuery] string? category,
        [FromQuery] DateTime? dateFrom,
        [FromQuery] DateTime? dateTo,
        CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new ExportCostRecordsQuery(category, dateFrom, dateTo), cancellationToken);
        return File(result.Content, result.ContentType, result.FileName);
    }

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

    [HttpDelete("cost-records/{id:guid}")]
    [Authorize(Roles = "Administrator,Manager,Director")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteCostRecord(Guid id, CancellationToken cancellationToken)
    {
        await _sender.Send(new DeleteCostRecordCommand(id), cancellationToken);
        return NoContent();
    }

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
