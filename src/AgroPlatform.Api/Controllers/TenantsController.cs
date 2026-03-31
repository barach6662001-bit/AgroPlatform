using AgroPlatform.Application.Tenants.Commands.SeedDemoData;
using AgroPlatform.Application.Tenants.Commands.UpdateTenant;
using AgroPlatform.Application.Tenants.Queries.GetCurrentTenant;
using AgroPlatform.Application.Tenants.Queries.GetTenants;
using AgroPlatform.Domain.Authorization;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgroPlatform.Api.Controllers;

/// <summary>
/// Manages tenant (хозяйство) settings.
/// </summary>
[ApiController]
[Route("api/tenants")]
[Authorize]
[Produces("application/json")]
public class TenantsController : ControllerBase
{
    private readonly ISender _sender;

    /// <summary>Initializes a new instance of <see cref="TenantsController"/>.</summary>
    public TenantsController(ISender sender)
    {
        _sender = sender;
    }

    /// <summary>Returns the list of tenants accessible to the current user.</summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTenants(CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetTenantsQuery(), cancellationToken);
        return Ok(result);
    }

    /// <summary>Returns the current tenant details.</summary>
    [HttpGet("current")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetCurrentTenant(CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetCurrentTenantQuery(), cancellationToken);
        return Ok(result);
    }

    /// <summary>Updates company details for the current tenant.</summary>
    [HttpPut("current")]
    [Authorize(Policy = Permissions.Admin.Manage)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateCurrentTenant(
        [FromBody] UpdateTenantCommand command,
        CancellationToken cancellationToken)
    {
        var result = await _sender.Send(command, cancellationToken);
        return Ok(result);
    }

    /// <summary>Seeds demo data for the current tenant.</summary>
    [HttpPost("seed-demo")]
    [Authorize(Policy = Permissions.Admin.Manage)]
    public async Task<IActionResult> SeedDemoData(CancellationToken ct)
    {
        await _sender.Send(new SeedDemoDataCommand(), ct);
        return Ok(new { success = true, message = "Demo data loaded" });
    }
}
