using AgroPlatform.Application.Companies.Commands.ResetUserPassword;
using AgroPlatform.Application.Users.Commands.UpdateUserRole;
using AgroPlatform.Application.Users.Queries.GetUsers;
using AgroPlatform.Domain.Authorization;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgroPlatform.Api.Controllers;

/// <summary>
/// Manages users within the current tenant — listing and role assignment.
/// </summary>
[ApiController]
[Authorize]
[Route("api/users")]
[Produces("application/json")]
public class UsersController : ControllerBase
{
    private readonly ISender _sender;

    public UsersController(ISender sender)
    {
        _sender = sender;
    }

    /// <summary>Returns all users belonging to the current tenant.</summary>
    [HttpGet]
    [Authorize(Policy = Permissions.Admin.Manage)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetUsers(CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetUsersQuery(), cancellationToken);
        return Ok(result);
    }

    /// <summary>Updates the role of a user within the current tenant.</summary>
    /// <param name="id">User ID.</param>
    /// <param name="command">The new role.</param>
    [HttpPut("{id}/role")]
    [Authorize(Policy = Permissions.Admin.Manage)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateUserRole(string id, [FromBody] UpdateUserRoleCommand command, CancellationToken cancellationToken)
    {
        if (id != command.UserId)
            return BadRequest();

        await _sender.Send(command, cancellationToken);
        return NoContent();
    }

    /// <summary>Resets a user's password. Sets RequirePasswordChange = true.</summary>
    [HttpPut("{userId}/reset-password")]
    [Authorize(Policy = Permissions.Admin.Manage)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ResetUserPassword(string userId, [FromBody] ResetUserPasswordCommand command, CancellationToken cancellationToken)
    {
        if (userId != command.UserId)
            return BadRequest();

        await _sender.Send(command, cancellationToken);
        return NoContent();
    }
}
