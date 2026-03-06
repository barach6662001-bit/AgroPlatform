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
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgroPlatform.Api.Controllers;

/// <summary>
/// Manages agro-operations (sowing, fertilizing, crop protection, tillage, harvest).
/// Supports attaching resources (materials) and machinery, and completing operations
/// with automatic stock deduction.
/// </summary>
[ApiController]
[Authorize]
[Route("api/agro-operations")]
[Produces("application/json")]
public class AgroOperationsController : ControllerBase
{
    private readonly ISender _sender;

    /// <summary>Initializes a new instance of <see cref="AgroOperationsController"/>.</summary>
    public AgroOperationsController(ISender sender)
    {
        _sender = sender;
    }

    /// <summary>Creates a new agro-operation.</summary>
    /// <param name="command">Operation creation data (type, field, planned date).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The ID of the created operation.</returns>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateAgroOperation([FromBody] CreateAgroOperationCommand command, CancellationToken cancellationToken)
    {
        var id = await _sender.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetAgroOperation), new { id }, new { id });
    }

    /// <summary>Returns a paginated list of agro-operations with optional filters.</summary>
    /// <param name="fieldId">Optional field filter.</param>
    /// <param name="operationType">Optional operation type filter.</param>
    /// <param name="isCompleted">Optional completion status filter.</param>
    /// <param name="dateFrom">Start of the planned date range (inclusive).</param>
    /// <param name="dateTo">End of the planned date range (inclusive).</param>
    /// <param name="page">Page number (1-based, default 1).</param>
    /// <param name="pageSize">Page size (default 20).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
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

    /// <summary>Returns detailed information about a single agro-operation.</summary>
    /// <param name="id">Operation ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetAgroOperation(Guid id, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetAgroOperationByIdQuery(id), cancellationToken);
        if (result == null)
            return NotFound();
        return Ok(result);
    }

    /// <summary>Updates an agro-operation (only while it is not yet completed).</summary>
    /// <param name="id">Operation ID (must match the ID in the request body).</param>
    /// <param name="command">Updated operation data.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateAgroOperation(Guid id, [FromBody] UpdateAgroOperationCommand command, CancellationToken cancellationToken)
    {
        if (id != command.Id)
            return BadRequest();

        await _sender.Send(command, cancellationToken);
        return NoContent();
    }

    /// <summary>
    /// Marks an agro-operation as completed. Triggers automatic stock deduction
    /// for all attached resources with actual quantities set.
    /// Returns 409 Conflict if the operation is already completed.
    /// Returns 422 Unprocessable Entity if a resource has insufficient stock balance.
    /// </summary>
    /// <param name="id">Operation ID (must match the ID in the request body).</param>
    /// <param name="command">Completion data (completion date).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    [HttpPost("{id:guid}/complete")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    public async Task<IActionResult> CompleteAgroOperation(Guid id, [FromBody] CompleteAgroOperationCommand command, CancellationToken cancellationToken)
    {
        if (id != command.Id)
            return BadRequest();

        await _sender.Send(command, cancellationToken);
        return NoContent();
    }

    /// <summary>Soft-deletes an agro-operation.</summary>
    /// <param name="id">Operation ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteAgroOperation(Guid id, CancellationToken cancellationToken)
    {
        await _sender.Send(new DeleteAgroOperationCommand(id), cancellationToken);
        return NoContent();
    }

    /// <summary>Attaches a resource (material) to an agro-operation.</summary>
    /// <param name="id">Operation ID (must match <c>AgroOperationId</c> in the request body).</param>
    /// <param name="command">Resource data (item, planned quantity).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The ID of the created operation-resource record.</returns>
    [HttpPost("{id:guid}/resources")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<IActionResult> AddResource(Guid id, [FromBody] AddResourceCommand command, CancellationToken cancellationToken)
    {
        if (id != command.AgroOperationId)
            return BadRequest();

        var resourceId = await _sender.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetAgroOperation), new { id }, new { id = resourceId });
    }

    /// <summary>Updates the actual quantity consumed for a resource in an operation.</summary>
    /// <param name="resourceId">Operation-resource record ID (must match the ID in the request body).</param>
    /// <param name="command">Actual quantity data.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    [HttpPut("resources/{resourceId:guid}/actual")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateResourceActual(Guid resourceId, [FromBody] UpdateResourceActualCommand command, CancellationToken cancellationToken)
    {
        if (resourceId != command.ResourceId)
            return BadRequest();

        await _sender.Send(command, cancellationToken);
        return NoContent();
    }

    /// <summary>Removes a resource from an agro-operation.</summary>
    /// <param name="resourceId">Operation-resource record ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    [HttpDelete("resources/{resourceId:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RemoveResource(Guid resourceId, CancellationToken cancellationToken)
    {
        await _sender.Send(new RemoveResourceCommand(resourceId), cancellationToken);
        return NoContent();
    }

    /// <summary>Attaches a machine to an agro-operation.</summary>
    /// <param name="id">Operation ID (must match <c>AgroOperationId</c> in the request body).</param>
    /// <param name="command">Machinery data (machine ID).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The ID of the created operation-machinery record.</returns>
    [HttpPost("{id:guid}/machinery")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<IActionResult> AddMachinery(Guid id, [FromBody] AddMachineryCommand command, CancellationToken cancellationToken)
    {
        if (id != command.AgroOperationId)
            return BadRequest();

        var machineryId = await _sender.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetAgroOperation), new { id }, new { id = machineryId });
    }

    /// <summary>Updates machinery details in an agro-operation.</summary>
    /// <param name="machineryId">Operation-machinery record ID (must match the ID in the request body).</param>
    /// <param name="command">Updated machinery data.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    [HttpPut("machinery/{machineryId:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateMachinery(Guid machineryId, [FromBody] UpdateMachineryCommand command, CancellationToken cancellationToken)
    {
        if (machineryId != command.MachineryId)
            return BadRequest();

        await _sender.Send(command, cancellationToken);
        return NoContent();
    }

    /// <summary>Removes a machine from an agro-operation.</summary>
    /// <param name="machineryId">Operation-machinery record ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    [HttpDelete("machinery/{machineryId:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RemoveMachinery(Guid machineryId, CancellationToken cancellationToken)
    {
        await _sender.Send(new RemoveMachineryCommand(machineryId), cancellationToken);
        return NoContent();
    }
}
