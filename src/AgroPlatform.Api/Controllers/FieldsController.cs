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

[ApiController]
[Authorize]
[Route("api/fields")]
public class FieldsController : ControllerBase
{
    private readonly ISender _sender;

    public FieldsController(ISender sender)
    {
        _sender = sender;
    }

    [HttpPost]
    public async Task<IActionResult> CreateField([FromBody] CreateFieldCommand command, CancellationToken cancellationToken)
    {
        var id = await _sender.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetField), new { id }, new { id });
    }

    [HttpGet]
    public async Task<IActionResult> GetFields([FromQuery] CropType? currentCrop, [FromQuery] string? searchTerm, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetFieldsQuery(currentCrop, searchTerm), cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetField(Guid id, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetFieldByIdQuery(id), cancellationToken);
        if (result == null)
            return NotFound();
        return Ok(result);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateField(Guid id, [FromBody] UpdateFieldCommand command, CancellationToken cancellationToken)
    {
        if (id != command.Id)
            return BadRequest();

        await _sender.Send(command, cancellationToken);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteField(Guid id, CancellationToken cancellationToken)
    {
        await _sender.Send(new DeleteFieldCommand(id), cancellationToken);
        return NoContent();
    }

    [HttpPost("assign-crop")]
    public async Task<IActionResult> AssignCrop([FromBody] AssignCropCommand command, CancellationToken cancellationToken)
    {
        var id = await _sender.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetField), new { id = command.FieldId }, new { id });
    }

    [HttpPut("crop-history/{cropHistoryId:guid}/yield")]
    public async Task<IActionResult> UpdateYield(Guid cropHistoryId, [FromBody] UpdateYieldCommand command, CancellationToken cancellationToken)
    {
        if (cropHistoryId != command.CropHistoryId)
            return BadRequest();

        await _sender.Send(command, cancellationToken);
        return NoContent();
    }

    [HttpPost("rotation-plans")]
    public async Task<IActionResult> PlanRotation([FromBody] PlanRotationCommand command, CancellationToken cancellationToken)
    {
        var id = await _sender.Send(command, cancellationToken);
        return Ok(new { id });
    }

    [HttpDelete("rotation-plans/{planId:guid}")]
    public async Task<IActionResult> DeleteRotationPlan(Guid planId, CancellationToken cancellationToken)
    {
        await _sender.Send(new DeleteRotationPlanCommand(planId), cancellationToken);
        return NoContent();
    }
}
