using AgroPlatform.Application.Companies.Commands.ActivateUser;
using AgroPlatform.Application.Companies.Commands.CreateCompany;
using AgroPlatform.Application.Companies.Commands.CreateUser;
using AgroPlatform.Application.Companies.Commands.DeactivateCompany;
using AgroPlatform.Application.Companies.Commands.DeactivateUser;
using AgroPlatform.Application.Companies.Commands.UpdateCompany;
using AgroPlatform.Application.Companies.Commands.UpdateUserRoleByAdmin;
using AgroPlatform.Application.Companies.Queries.GetCompanies;
using AgroPlatform.Application.Companies.Queries.GetCompanyUsers;
using AgroPlatform.Domain.Authorization;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgroPlatform.Api.Controllers;

/// <summary>
/// Platform-level company and user management — SuperAdmin only.
/// </summary>
[ApiController]
[Authorize(Policy = Permissions.Platform.SuperAdmin)]
[Route("api/companies")]
[Produces("application/json")]
public class CompaniesController : ControllerBase
{
    private readonly ISender _sender;

    public CompaniesController(ISender sender)
    {
        _sender = sender;
    }

    /// <summary>Returns all companies (tenants).</summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCompanies(CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetCompaniesQuery(), cancellationToken);
        return Ok(result);
    }

    /// <summary>Creates a new company (tenant).</summary>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateCompany([FromBody] CreateCompanyCommand command, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetCompanyUsers), new { id = result.Id }, result);
    }

    /// <summary>Updates a company's details.</summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateCompany(Guid id, [FromBody] UpdateCompanyCommand command, CancellationToken cancellationToken)
    {
        if (id != command.Id)
            return BadRequest();

        await _sender.Send(command, cancellationToken);
        return NoContent();
    }

    /// <summary>Deactivates a company.</summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeactivateCompany(Guid id, CancellationToken cancellationToken)
    {
        await _sender.Send(new DeactivateCompanyCommand(id), cancellationToken);
        return NoContent();
    }

    /// <summary>Returns all users belonging to a company.</summary>
    [HttpGet("{id:guid}/users")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCompanyUsers(Guid id, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetCompanyUsersQuery(id), cancellationToken);
        return Ok(result);
    }

    /// <summary>Creates a new user in a company. Sets RequirePasswordChange = true.</summary>
    [HttpPost("{id:guid}/users")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateUser(Guid id, [FromBody] CreateUserCommand command, CancellationToken cancellationToken)
    {
        if (id != command.TenantId)
            return BadRequest();

        var result = await _sender.Send(command, cancellationToken);
        return Created(string.Empty, result);
    }

    /// <summary>Deactivates a user.</summary>
    [HttpDelete("users/{userId}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeactivateUser(string userId, CancellationToken cancellationToken)
    {
        await _sender.Send(new DeactivateUserCommand(userId), cancellationToken);
        return NoContent();
    }

    /// <summary>Activates a user.</summary>
    [HttpPost("users/{userId}/activate")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ActivateUser(string userId, CancellationToken cancellationToken)
    {
        await _sender.Send(new ActivateUserCommand(userId), cancellationToken);
        return NoContent();
    }

    /// <summary>Changes a user's role.</summary>
    [HttpPut("users/{userId}/role")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateUserRole(string userId, [FromBody] UpdateUserRoleByAdminCommand command, CancellationToken cancellationToken)
    {
        if (userId != command.UserId)
            return BadRequest();

        await _sender.Send(command, cancellationToken);
        return NoContent();
    }
}
