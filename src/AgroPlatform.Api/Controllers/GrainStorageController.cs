using AgroPlatform.Application.GrainStorage.Commands.CreateGrainBatch;
using AgroPlatform.Application.GrainStorage.Commands.CreateGrainMovement;
using AgroPlatform.Application.GrainStorage.Commands.SplitGrainBatch;
using AgroPlatform.Application.GrainStorage.Queries.GetGrainBatches;
using AgroPlatform.Application.GrainStorage.Queries.GetGrainMovements;
using AgroPlatform.Application.GrainStorage.Queries.GetGrainSummary;
using AgroPlatform.Domain.Authorization;
using AgroPlatform.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
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
        [FromQuery] decimal? minQuantity = null,
        CancellationToken cancellationToken = default)
    {
        var result = await _sender.Send(new GetGrainBatchesQuery(storageId, ownershipType, page, pageSize, minQuantity), cancellationToken);
        return Ok(result);
    }

    /// <summary>Creates a new grain batch (receives grain into storage).</summary>
    [HttpPost]
    [Authorize(Policy = Permissions.GrainStorage.Manage)]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateGrainBatch([FromBody] CreateGrainBatchCommand command, CancellationToken cancellationToken)
    {
        var id = await _sender.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetGrainBatches), new { }, new { id });
    }

    /// <summary>Records a grain movement (in or out) for a specific batch.</summary>
    [HttpPost("{id:guid}/movements")]
    [Authorize(Policy = Permissions.GrainStorage.Manage)]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CreateGrainMovement(Guid id, [FromBody] CreateGrainMovementCommand command, CancellationToken cancellationToken)
    {
        var movementId = await _sender.Send(command with { GrainBatchId = id }, cancellationToken);
        return CreatedAtAction(nameof(GetGrainMovements), new { id }, new { id = movementId });
    }

    /// <summary>Returns the list of grain movements for a specific batch.</summary>
    [HttpGet("{id:guid}/movements")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetGrainMovements(Guid id, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetGrainMovementsQuery(id), cancellationToken);
        return Ok(result);
    }

    /// <summary>Splits a grain batch across multiple target storage facilities.</summary>
    [HttpPost("{id:guid}/split")]
    [Authorize(Policy = Permissions.GrainStorage.Manage)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> SplitGrainBatch(Guid id, [FromBody] SplitGrainBatchRequest request, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new SplitGrainBatchCommand(id, request.Targets, request.Notes), cancellationToken);
        return Ok(result);
    }

    /// <summary>Returns a summary of grain across all storages, grouped by grain type.</summary>
    [HttpGet("summary")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetGrainSummary(CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetGrainSummaryQuery(), cancellationToken);
        return Ok(result);
    }
}

/// <summary>Request body for splitting a grain batch.</summary>
public record SplitGrainBatchRequest(List<SplitTarget> Targets, string? Notes);
