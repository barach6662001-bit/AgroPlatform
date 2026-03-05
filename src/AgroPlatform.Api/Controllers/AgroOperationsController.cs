using AgroPlatform.Application.AgroOperations.Commands.AddMachinery;
using AgroPlatform.Application.AgroOperations.Commands.AddResource;
using AgroPlatform.Application.AgroOperations.Commands.CompleteAgroOperation;
using AgroPlatform.Application.AgroOperations.Commands.CreateAgroOperation;
using AgroPlatform.Application.AgroOperations.Commands.DeleteAgroOperation;
using AgroPlatform.Application.AgroOperations.Commands.RemoveMachinery;
using AgroPlatform.Application.AgroOperations.Commands.RemoveResource;
using AgroPlatform.Application.AgroOperations.Commands.UpdateAgroOperation;
using AgroPlatform.Application.AgroOperations.Commands.UpdateMachinery;
using AgroPlatform.Application.AgroOperations.Commands.UpdateResourceActual;
using AgroPlatform.Application.AgroOperations.Queries.GetAgroOperationById;
using AgroPlatform.Application.AgroOperations.Queries.GetAgroOperations;
using AgroPlatform.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace AgroPlatform.Api.Controllers;

[ApiController]
[Route("api/agro-operations")]
public class AgroOperationsController : ControllerBase
{
    private readonly ISender _sender;

    public AgroOperationsController(ISender sender)
    {
        _sender = sender;
    }

    [HttpPost]
    public async Task<IActionResult> CreateAgroOperation([FromBody] CreateAgroOperationCommand command, CancellationToken cancellationToken)
    {
        var id = await _sender.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetAgroOperation), new { id }, new { id });
    }

    [HttpGet]
    public async Task<IActionResult> GetAgroOperations(
        [FromQuery] Guid? fieldId,
        [FromQuery] AgroOperationType? operationType,
        [FromQuery] bool? isCompleted,
        [FromQuery] DateTime? dateFrom,
        [FromQuery] DateTime? dateTo,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var result = await _sender.Send(new GetAgroOperationsQuery(fieldId, operationType, isCompleted, dateFrom, dateTo, page, pageSize), cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetAgroOperation(Guid id, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetAgroOperationByIdQuery(id), cancellationToken);
        if (result == null)
            return NotFound();
        return Ok(result);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateAgroOperation(Guid id, [FromBody] UpdateAgroOperationCommand command, CancellationToken cancellationToken)
    {
        if (id != command.Id)
            return BadRequest();

        await _sender.Send(command, cancellationToken);
        return NoContent();
    }

    [HttpPost("{id:guid}/complete")]
    public async Task<IActionResult> CompleteAgroOperation(Guid id, [FromBody] CompleteAgroOperationCommand command, CancellationToken cancellationToken)
    {
        if (id != command.Id)
            return BadRequest();

        await _sender.Send(command, cancellationToken);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteAgroOperation(Guid id, CancellationToken cancellationToken)
    {
        await _sender.Send(new DeleteAgroOperationCommand(id), cancellationToken);
        return NoContent();
    }

    [HttpPost("{id:guid}/resources")]
    public async Task<IActionResult> AddResource(Guid id, [FromBody] AddResourceCommand command, CancellationToken cancellationToken)
    {
        if (id != command.AgroOperationId)
            return BadRequest();

        var resourceId = await _sender.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetAgroOperation), new { id }, new { id = resourceId });
    }

    [HttpPut("resources/{resourceId:guid}/actual")]
    public async Task<IActionResult> UpdateResourceActual(Guid resourceId, [FromBody] UpdateResourceActualCommand command, CancellationToken cancellationToken)
    {
        if (resourceId != command.ResourceId)
            return BadRequest();

        await _sender.Send(command, cancellationToken);
        return NoContent();
    }

    [HttpDelete("resources/{resourceId:guid}")]
    public async Task<IActionResult> RemoveResource(Guid resourceId, CancellationToken cancellationToken)
    {
        await _sender.Send(new RemoveResourceCommand(resourceId), cancellationToken);
        return NoContent();
    }

    [HttpPost("{id:guid}/machinery")]
    public async Task<IActionResult> AddMachinery(Guid id, [FromBody] AddMachineryCommand command, CancellationToken cancellationToken)
    {
        if (id != command.AgroOperationId)
            return BadRequest();

        var machineryId = await _sender.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetAgroOperation), new { id }, new { id = machineryId });
    }

    [HttpPut("machinery/{machineryId:guid}")]
    public async Task<IActionResult> UpdateMachinery(Guid machineryId, [FromBody] UpdateMachineryCommand command, CancellationToken cancellationToken)
    {
        if (machineryId != command.MachineryId)
            return BadRequest();

        await _sender.Send(command, cancellationToken);
        return NoContent();
    }

    [HttpDelete("machinery/{machineryId:guid}")]
    public async Task<IActionResult> RemoveMachinery(Guid machineryId, CancellationToken cancellationToken)
    {
        await _sender.Send(new RemoveMachineryCommand(machineryId), cancellationToken);
        return NoContent();
    }
}
