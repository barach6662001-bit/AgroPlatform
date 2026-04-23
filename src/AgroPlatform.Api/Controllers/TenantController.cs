using AgroPlatform.Application.Tenants.DTOs;
using AgroPlatform.Application.Tenants.Queries.GetDataBoundaries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgroPlatform.Api.Controllers;

[ApiController]
[Route("api/tenant")]
[Authorize]
[Produces("application/json")]
public sealed class TenantController : ControllerBase
{
    private readonly ISender _sender;

    public TenantController(ISender sender)
    {
        _sender = sender;
    }

    /// <summary>
    /// Returns earliest and latest operational dates for the current tenant,
    /// aggregated across AgroOperations, CostRecords and Sales.
    /// </summary>
    [HttpGet("data-boundaries")]
    [ResponseCache(Duration = 3600, Location = ResponseCacheLocation.Client)]
    [ProducesResponseType(typeof(TenantDataBoundariesDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDataBoundaries(CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetDataBoundariesQuery(), cancellationToken);
        return Ok(result);
    }
}
