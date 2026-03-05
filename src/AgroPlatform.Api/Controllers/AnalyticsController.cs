using AgroPlatform.Application.Analytics.Queries.GetDashboard;
using AgroPlatform.Application.Analytics.Queries.GetFieldEfficiency;
using AgroPlatform.Application.Analytics.Queries.GetResourceConsumption;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgroPlatform.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/analytics")]
public class AnalyticsController : ControllerBase
{
    private readonly ISender _sender;

    public AnalyticsController(ISender sender)
    {
        _sender = sender;
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard(CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetDashboardQuery(), cancellationToken);
        return Ok(result);
    }

    [HttpGet("resource-consumption")]
    public async Task<IActionResult> GetResourceConsumption(
        [FromQuery] DateTime? dateFrom,
        [FromQuery] DateTime? dateTo,
        [FromQuery] Guid? fieldId,
        CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetResourceConsumptionQuery(dateFrom, dateTo, fieldId), cancellationToken);
        return Ok(result);
    }

    [HttpGet("field-efficiency")]
    public async Task<IActionResult> GetFieldEfficiency(CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetFieldEfficiencyQuery(), cancellationToken);
        return Ok(result);
    }
}
