using AgroPlatform.Application.Economics.Commands.CreateCostRecord;
using AgroPlatform.Application.Economics.Commands.DeleteCostRecord;
using AgroPlatform.Application.Economics.DTOs;
using AgroPlatform.Application.Economics.Queries.ExportCostRecords;
using AgroPlatform.Application.Economics.Queries.GetBreakEven;
using AgroPlatform.Application.Economics.Queries.GetCostRecords;
using AgroPlatform.Application.Economics.Queries.GetCostSummary;
using AgroPlatform.Application.Economics.Queries.GetFieldPnl;
using AgroPlatform.Application.Economics.Queries.GetCostAnalytics;
using AgroPlatform.Application.Economics.Queries.GetMarginality;
using AgroPlatform.Application.Economics.Queries.GetSeasonComparison;
using AgroPlatform.Api.FeatureFlags;
using AgroPlatform.Domain.Authorization;
using AgroPlatform.Domain.Enums;
using AgroPlatform.Domain.FeatureFlags;
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
    [Authorize(Policy = Permissions.Economics.Manage)]
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
        var cat = Enum.TryParse<CostCategory>(category, out var parsed) ? (CostCategory?)parsed : null;
        var result = await _sender.Send(new GetCostRecordsQuery(cat, fieldId, agroOperationId, dateFrom, dateTo, page, pageSize), cancellationToken);
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
        var cat = Enum.TryParse<CostCategory>(category, out var parsed) ? (CostCategory?)parsed : null;
        var result = await _sender.Send(new ExportCostRecordsQuery(cat, dateFrom, dateTo), cancellationToken);
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
        var cat = Enum.TryParse<CostCategory>(category, out var parsed) ? (CostCategory?)parsed : null;
        var result = await _sender.Send(new GetCostSummaryQuery(cat, dateFrom, dateTo), cancellationToken);
        return Ok(result);
    }

    [HttpDelete("cost-records/{id:guid}")]
    [Authorize(Policy = Permissions.Economics.Manage)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteCostRecord(Guid id, CancellationToken cancellationToken)
    {
        await _sender.Send(new DeleteCostRecordCommand(id), cancellationToken);
        return NoContent();
    }

    [HttpGet("field-pnl")]
    [RequireFeatureFlag(OptionalFeatureFlagKeys.PnlByFields)]
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

    /// <summary>Returns marginality summary (revenue vs costs by product and by field) for the given year.</summary>
    [HttpGet("marginality")]
    [RequireFeatureFlag(OptionalFeatureFlagKeys.AnalyticsMarginality)]
    [ProducesResponseType(typeof(MarginalitySummaryDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMarginality(
        [FromQuery] int? year,
        CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetMarginalityQuery(year), cancellationToken);
        return Ok(result);
    }

    /// <summary>Returns cost analytics aggregations (by category, by month) for the given year.</summary>
    [HttpGet("cost-analytics")]
    [RequireFeatureFlag(OptionalFeatureFlagKeys.AnalyticsExpenseAnalytics)]
    [ProducesResponseType(typeof(CostAnalyticsDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCostAnalytics(
        [FromQuery] int? year,
        CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetCostAnalyticsQuery(year), cancellationToken);
        return Ok(result);
    }

    /// <summary>Returns aggregated metrics for each requested season year (revenue, costs, margin, per-ha KPIs).</summary>
    [HttpGet("season-comparison")]
    [RequireFeatureFlag(OptionalFeatureFlagKeys.AnalyticsSeasonComparison)]
    [ProducesResponseType(typeof(IReadOnlyList<EconomicsByYearDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSeasonComparison(
        [FromQuery] string? years,
        CancellationToken cancellationToken)
    {
        var yearList = (years ?? string.Empty)
            .Split(',', StringSplitOptions.RemoveEmptyEntries)
            .Select(y => int.TryParse(y.Trim(), out var v) ? (int?)v : null)
            .Where(y => y.HasValue)
            .Select(y => y!.Value)
            .ToArray();

        var result = await _sender.Send(new GetSeasonComparisonQuery(yearList), cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Returns break-even yield (t/ha) per field for the given year and assumed sale price.
    /// Formula: breakEvenYield = totalCosts / (pricePerTonne * areaHectares)
    /// </summary>
    [HttpGet("break-even")]
    [RequireFeatureFlag(OptionalFeatureFlagKeys.AnalyticsBreakEven)]
    [ProducesResponseType(typeof(IReadOnlyList<BreakEvenDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetBreakEven(
        [FromQuery] int? year,
        [FromQuery] decimal pricePerTonne = 0,
        CancellationToken cancellationToken = default)
    {
        var result = await _sender.Send(new GetBreakEvenQuery(year, pricePerTonne), cancellationToken);
        return Ok(result);
    }
}
