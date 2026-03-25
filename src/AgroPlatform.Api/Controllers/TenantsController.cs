using AgroPlatform.Application.Tenants.Commands.RegisterTenant;
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
/// Manages tenant (хозяйство) onboarding and registration.
/// </summary>
[ApiController]
[Route("api/tenants")]
[Produces("application/json")]
public class TenantsController : ControllerBase
{
    private readonly ISender _sender;

    /// <summary>Initializes a new instance of <see cref="TenantsController"/>.</summary>
    public TenantsController(ISender sender)
    {
        _sender = sender;
    }

    /// <summary>Registers a new tenant (хозяйство) during onboarding.</summary>
    /// <param name="command">Tenant registration data (name and optional INN).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The created tenant on success.</returns>
    [HttpPost("register")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Register(
        [FromBody] RegisterTenantCommand command,
        CancellationToken cancellationToken)
    {
        var tenant = await _sender.Send(command, cancellationToken);
        return Created($"/api/tenants/{tenant.Id}", tenant);
    }

    /// <summary>Returns the list of tenants accessible to the current user.</summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>List of tenant DTOs.</returns>
    [HttpGet]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTenants(CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetTenantsQuery(), cancellationToken);
        return Ok(result);
    }

    /// <summary>Returns the current tenant details.</summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    [HttpGet("current")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetCurrentTenant(CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetCurrentTenantQuery(), cancellationToken);
        return Ok(result);
    }

    /// <summary>Updates company details for the current tenant.</summary>
    /// <param name="command">Updated company data.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
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

    /// <summary>Seed demo data for the current tenant</summary>
    [HttpPost("seed-demo")]
    [Authorize(Policy = Permissions.Admin.Manage)]
    public async Task<IActionResult> SeedDemoData(CancellationToken ct)
    {
        await _sender.Send(new SeedDemoDataCommand(), ct);
        return Ok(new { success = true, message = "Demo data loaded" });
    }
}
