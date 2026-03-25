using AgroPlatform.Application.Users.Commands.UpdatePermissions;
using AgroPlatform.Application.Users.Queries.GetPermissions;
using AgroPlatform.Domain.Authorization;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgroPlatform.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = Permissions.Admin.Manage)]
public class PermissionsController : ControllerBase
{
    private readonly IMediator _mediator;

    public PermissionsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Get all permissions for a specific role.
    /// </summary>
    [HttpGet("{roleId}")]
    public async Task<ActionResult<List<PermissionDto>>> GetPermissions(Guid roleId)
    {
        var result = await _mediator.Send(new GetPermissionsQuery(roleId));
        return Ok(result);
    }

    /// <summary>
    /// Update permissions for a role.
    /// </summary>
    [HttpPut("{roleId}")]
    public async Task<IActionResult> UpdatePermissions(Guid roleId, [FromBody] List<UpdatePermissionDto> permissions)
    {
        var command = new UpdatePermissionsCommand(roleId, permissions);
        await _mediator.Send(command);
        return Ok();
    }
}
