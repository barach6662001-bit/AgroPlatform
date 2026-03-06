using AgroPlatform.Application.Fields.Commands.AssignCrop;
using AgroPlatform.Application.Fields.Commands.CreateField;
using AgroPlatform.Application.Fields.Commands.DeleteField;
using AgroPlatform.Application.Fields.Commands.DeleteRotationPlan;
using AgroPlatform.Application.Fields.Commands.PlanRotation;
using AgroPlatform.Application.Fields.Commands.UpdateField;
using AgroPlatform.Application.Fields.Commands.UpdateYield;
using AgroPlatform.Application.Fields.Queries.GetFieldById;
using AgroPlatform.Application.Fields.Queries.GetFields;
using AgroPlatform.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgroPlatform.Api.Controllers;

/// <summary>
/// Manages agricultural fields — cadastral data, current crop, crop history,
/// yield records and rotation plans.
/// </summary>
[ApiController]
[Authorize]
[Route("api/fields")]
[Produces("application/json")]
public class FieldsController : ControllerBase
{
    private readonly ISender _sender;

    /// <summary>Initializes a new instance of <see cref="FieldsController"/>.</summary>
    public FieldsController(ISender sender)
    {
        _sender = sender;
    }

    /// <summary>Creates a new field.</summary>
    /// <param name="command">Field creation data (name, area, cadastral number).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The ID of the created field.</returns>
    [HttpPost]
    [Authorize(Roles = "Administrator,Manager,Agronomist")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateField([FromBody] CreateFieldCommand command, CancellationToken cancellationToken)
    {
        var id = await _sender.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetField), new { id }, new { id });
    }

    /// <summary>Returns a list of fields, optionally filtered by current crop or search term.</summary>
    /// <param name="currentCrop">Optional crop type filter.</param>
    /// <param name="searchTerm">Optional free-text search (name, cadastral number).</param>
    /// <param name="page">Page number (1-based, default 1).</param>
    /// <param name="pageSize">Page size (default 20).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetFields([FromQuery] CropType? currentCrop, [FromQuery] string? searchTerm, [FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken cancellationToken = default)
    {
        var result = await _sender.Send(new GetFieldsQuery(currentCrop, searchTerm, page, pageSize), cancellationToken);
        return Ok(result);
    }

    /// <summary>Returns detailed information about a single field including crop history.</summary>
    /// <param name="id">Field ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetField(Guid id, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetFieldByIdQuery(id), cancellationToken);
        if (result == null)
            return NotFound();
        return Ok(result);
    }

    /// <summary>Updates field data (name, area, cadastral number).</summary>
    /// <param name="id">Field ID (must match the ID in the request body).</param>
    /// <param name="command">Updated field data.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Administrator,Manager,Agronomist")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateField(Guid id, [FromBody] UpdateFieldCommand command, CancellationToken cancellationToken)
    {
        if (id != command.Id)
            return BadRequest();

        await _sender.Send(command, cancellationToken);
        return NoContent();
    }

    /// <summary>Soft-deletes a field.</summary>
    /// <param name="id">Field ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Administrator,Manager,Agronomist")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteField(Guid id, CancellationToken cancellationToken)
    {
        await _sender.Send(new DeleteFieldCommand(id), cancellationToken);
        return NoContent();
    }

    /// <summary>Assigns a crop to a field, creating a new crop history entry.</summary>
    /// <param name="command">Crop assignment data (field, crop type, sowing date).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The ID of the created crop history entry.</returns>
    [HttpPost("assign-crop")]
    [Authorize(Roles = "Administrator,Manager,Agronomist")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<IActionResult> AssignCrop([FromBody] AssignCropCommand command, CancellationToken cancellationToken)
    {
        var id = await _sender.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetField), new { id = command.FieldId }, new { id });
    }

    /// <summary>Updates the actual yield for a crop history entry.</summary>
    /// <param name="cropHistoryId">Crop history entry ID (must match the ID in the request body).</param>
    /// <param name="command">Yield data.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    [HttpPut("crop-history/{cropHistoryId:guid}/yield")]
    [Authorize(Roles = "Administrator,Manager,Agronomist")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateYield(Guid cropHistoryId, [FromBody] UpdateYieldCommand command, CancellationToken cancellationToken)
    {
        if (cropHistoryId != command.CropHistoryId)
            return BadRequest();

        await _sender.Send(command, cancellationToken);
        return NoContent();
    }

    /// <summary>Creates a crop rotation plan for a field.</summary>
    /// <param name="command">Rotation plan data (field, planned crop, planned year).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The ID of the created rotation plan.</returns>
    [HttpPost("rotation-plans")]
    [Authorize(Roles = "Administrator,Manager,Agronomist")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<IActionResult> PlanRotation([FromBody] PlanRotationCommand command, CancellationToken cancellationToken)
    {
        var id = await _sender.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetField), new { id = command.FieldId }, new { id });
    }

    /// <summary>Deletes a crop rotation plan.</summary>
    /// <param name="planId">Rotation plan ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    [HttpDelete("rotation-plans/{planId:guid}")]
    [Authorize(Roles = "Administrator,Manager,Agronomist")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteRotationPlan(Guid planId, CancellationToken cancellationToken)
    {
        await _sender.Send(new DeleteRotationPlanCommand(planId), cancellationToken);
        return NoContent();
    }
}
