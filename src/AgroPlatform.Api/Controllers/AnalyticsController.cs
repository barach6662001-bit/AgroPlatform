using AgroPlatform.Application.Analytics.Queries.GetDashboard;
using AgroPlatform.Application.Analytics.Queries.GetFieldEfficiency;
using AgroPlatform.Application.Analytics.Queries.GetFuelAnalytics;
using AgroPlatform.Application.Analytics.Queries.GetResourceConsumption;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgroPlatform.Api.Controllers;

/// <summary>
/// Provides aggregated analytics: dashboard summary, resource consumption
/// by period / field, and field efficiency metrics.
/// </summary>
[ApiController]
[Authorize]
[Route("api/analytics")]
[Produces("application/json")]
public class AnalyticsController : ControllerBase
{
    private readonly ISender _sender;

    /// <summary>Initializes a new instance of <see cref="AnalyticsController"/>.</summary>
    public AnalyticsController(ISender sender)
    {
        _sender = sender;
    }

    /// <summary>
    /// Returns the aggregated dashboard data: total fields, operations in progress,
    /// total costs, warehouse balances summary and recent activity.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    [HttpGet("dashboard")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDashboard(CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetDashboardQuery(), cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Returns resource (material) consumption grouped by item, optionally filtered
    /// by date range and/or field.
    /// </summary>
    /// <param name="dateFrom">Start of the date range (inclusive).</param>
    /// <param name="dateTo">End of the date range (inclusive).</param>
    /// <param name="fieldId">Optional field filter.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    [HttpGet("resource-consumption")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetResourceConsumption(
        [FromQuery] DateTime? dateFrom,
        [FromQuery] DateTime? dateTo,
        [FromQuery] Guid? fieldId,
        CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetResourceConsumptionQuery(dateFrom, dateTo, fieldId), cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Returns efficiency metrics per field: total costs, total yield and
    /// cost-per-hectare ratios.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    [HttpGet("field-efficiency")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetFieldEfficiency(CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetFieldEfficiencyQuery(), cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Returns fuel analytics: consumption per hectare per machine,
    /// machine comparison and monthly consumption trend (last 12 months).
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    [HttpGet("fuel")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetFuelAnalytics(CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetFuelAnalyticsQuery(), cancellationToken);
        return Ok(result);
    }
}
