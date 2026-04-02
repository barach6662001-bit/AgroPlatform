using AgroPlatform.Application.Admin.Commands.UpdateRolePermissions;
using AgroPlatform.Application.Admin.Queries.GetAvailablePolicies;
using AgroPlatform.Application.Admin.Queries.GetAvailableRoles;
using AgroPlatform.Application.Admin.Queries.GetRolePermissions;
using AgroPlatform.Domain.Authorization;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgroPlatform.Api.Controllers;

/// <summary>
/// Manages role-permission matrix (DB-driven RBAC).
/// </summary>
[ApiController]
[Route("api/admin/role-permissions")]
[Authorize(Policy = Permissions.Admin.Manage)]
[Produces("application/json")]
public class RolePermissionsController : ControllerBase
{
    private readonly ISender _sender;

    public RolePermissionsController(ISender sender) => _sender = sender;

    /// <summary>Returns all role-permission grants.</summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> Get(CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetRolePermissionsQuery(), cancellationToken);
        return Ok(result);
    }

    /// <summary>Returns available role names from the UserRole enum.</summary>
    [HttpGet("roles")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetRoles(CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetAvailableRolesQuery(), cancellationToken);
        return Ok(result);
    }

    /// <summary>Returns all available permission policy names.</summary>
    [HttpGet("policies")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPolicies(CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetAvailablePoliciesQuery(), cancellationToken);
        return Ok(result);
    }

    /// <summary>Upsert role-permission grants. Invalidates RBAC cache for affected roles.</summary>
    [HttpPut]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Update([FromBody] UpdateRolePermissionsCommand command, CancellationToken cancellationToken)
    {
        await _sender.Send(command, cancellationToken);
        return NoContent();
    }
}
