using AgroPlatform.Application.GrainStorage.Commands.CreateGrainStorage;
using AgroPlatform.Application.GrainStorage.Commands.DeleteGrainStorage;
using AgroPlatform.Application.GrainStorage.Commands.UpdateGrainStorage;
using AgroPlatform.Application.GrainStorage.Queries.GetGrainStorages;
using AgroPlatform.Domain.Authorization;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgroPlatform.Api.Controllers;

/// <summary>
/// Manages grain storage facilities (elevators, bins, flat storage, etc.).
/// These are separate from material Warehouses.
/// </summary>
[ApiController]
[Authorize]
[Route("api/grain-storages")]
[Produces("application/json")]
public class GrainStoragesController : ControllerBase
{
    private readonly ISender _sender;

    /// <summary>Initializes a new instance of <see cref="GrainStoragesController"/>.</summary>
    public GrainStoragesController(ISender sender)
    {
        _sender = sender;
    }

    /// <summary>Returns the list of grain storage facilities.</summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetGrainStorages(
        [FromQuery] bool? activeOnly,
        CancellationToken cancellationToken = default)
    {
        var result = await _sender.Send(new GetGrainStoragesQuery(activeOnly), cancellationToken);
        return Ok(result);
    }

    /// <summary>Creates a new grain storage facility.</summary>
    [HttpPost]
    [Authorize(Policy = Permissions.GrainStorage.Manage)]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateGrainStorage([FromBody] CreateGrainStorageCommand command, CancellationToken cancellationToken)
    {
        var id = await _sender.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetGrainStorages), new { }, new { id });
    }

    /// <summary>Updates an existing grain storage facility.</summary>
    [HttpPut("{id:guid}")]
    [Authorize(Policy = Permissions.GrainStorage.Manage)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateGrainStorage(Guid id, [FromBody] UpdateGrainStorageCommand command, CancellationToken cancellationToken)
    {
        await _sender.Send(command with { Id = id }, cancellationToken);
        return NoContent();
    }

    /// <summary>Soft-deletes a grain storage facility.</summary>
    [HttpDelete("{id:guid}")]
    [Authorize(Policy = Permissions.GrainStorage.Manage)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteGrainStorage(Guid id, CancellationToken cancellationToken)
    {
        await _sender.Send(new DeleteGrainStorageCommand(id), cancellationToken);
        return NoContent();
    }
}
