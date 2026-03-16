using AgroPlatform.Application.GrainStorage.Commands.CreateGrainBatch;
using AgroPlatform.Application.GrainStorage.Commands.CreateGrainMovement;
using AgroPlatform.Application.GrainStorage.Queries.GetGrainBatches;
using AgroPlatform.Application.GrainStorage.Queries.GetGrainMovements;
using AgroPlatform.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace AgroPlatform.Api.Controllers;

/// <summary>
/// Manages grain batches and grain movements in grain storage facilities.
/// </summary>
[ApiController]
[Authorize]
[Route("api/grain-batches")]
[Produces("application/json")]
public class GrainStorageController : ControllerBase
{
    private readonly ISender _sender;

    /// <summary>Initializes a new instance of <see cref="GrainStorageController"/>.</summary>
    public GrainStorageController(ISender sender)
    {
        _sender = sender;
    }

    /// <summary>Returns a paginated list of grain batches, optionally filtered by storage and ownership type.</summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetGrainBatches(
        [FromQuery] Guid? storageId,
        [FromQuery] GrainOwnershipType? ownershipType,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var result = await _sender.Send(new GetGrainBatchesQuery(storageId, ownershipType, page, pageSize), cancellationToken);
        return Ok(result);
    }

    /// <summary>Creates a new grain batch (receipt of grain).</summary>
    [HttpPost]
    [Authorize(Roles = "Administrator,Manager,Storekeeper")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateGrainBatch([FromBody] CreateGrainBatchCommand command, CancellationToken cancellationToken)
    {
        var id = await _sender.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetGrainBatches), new { }, new { id });
    }

    /// <summary>Records a grain movement (in or out) for a specific batch.</summary>
    [HttpPost("{id:guid}/movements")]
    [Authorize(Roles = "Administrator,Manager,Storekeeper")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CreateGrainMovement(Guid id, [FromBody] CreateGrainMovementRequest request, CancellationToken cancellationToken)
    {
        var command = new CreateGrainMovementCommand(id, request.MovementType, request.QuantityTons, request.MovementDate, request.Reason, request.Notes);
        var movementId = await _sender.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetGrainMovements), new { id }, new { id = movementId });
    }

    /// <summary>Returns all movements for a specific grain batch.</summary>
    [HttpGet("{id:guid}/movements")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetGrainMovements(Guid id, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetGrainMovementsQuery(id), cancellationToken);
        return Ok(result);
    }
}

/// <summary>Request body for creating a grain movement.</summary>
public record CreateGrainMovementRequest(
    string MovementType,
    decimal QuantityTons,
    DateTime MovementDate,
    string? Reason,
    string? Notes
);
