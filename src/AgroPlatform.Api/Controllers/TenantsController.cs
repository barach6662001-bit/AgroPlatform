using AgroPlatform.Application.Tenants.Commands.RegisterTenant;
using AgroPlatform.Application.Tenants.Commands.SeedDemoData;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgroPlatform.Api.Controllers;

/// <summary>
/// Manages tenant (хозяйство) onboarding and registration.
/// </summary>
[ApiController]
[Route("api/tenants")]
[AllowAnonymous]
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

    /// <summary>Seed demo data for the current tenant</summary>
    [HttpPost("seed-demo")]
    [Authorize(Roles = "Administrator")]
    public async Task<IActionResult> SeedDemoData(CancellationToken ct)
    {
        await _sender.Send(new SeedDemoDataCommand(), ct);
        return Ok(new { success = true, message = "Demo data loaded" });
    }
}
