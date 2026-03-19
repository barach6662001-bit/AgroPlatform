using AgroPlatform.Application.Tenants.Commands.RegisterTenant;
using AgroPlatform.Application.Tenants.Commands.UpdateTenant;
using AgroPlatform.Application.Tenants.Queries.GetCurrentTenant;
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

    /// <summary>Gets the current tenant's information.</summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The current tenant details.</returns>
    [HttpGet("current")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetCurrent(CancellationToken cancellationToken)
    {
        var tenant = await _sender.Send(new GetCurrentTenantQuery(), cancellationToken);
        return Ok(tenant);
    }

    /// <summary>Updates the current tenant's company information.</summary>
    /// <param name="command">Updated company information.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The updated tenant details.</returns>
    [HttpPut("current")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateCurrent(
        [FromBody] UpdateTenantCommand command,
        CancellationToken cancellationToken)
    {
        var tenant = await _sender.Send(command, cancellationToken);
        return Ok(tenant);
    }
}
