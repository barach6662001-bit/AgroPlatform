using AgroPlatform.Application.GrainStorage.Commands.AdjustGrainBatch;
using AgroPlatform.Application.GrainStorage.Commands.AddGrainBatchPlacement;
using AgroPlatform.Application.GrainStorage.Commands.AddGrainReceipt;
using AgroPlatform.Application.GrainStorage.Queries.GetGrainTransfers;
using AgroPlatform.Application.GrainStorage.Queries.GetGrainStorageOverview;
using AgroPlatform.Application.GrainStorage.Commands.CreateGrainBatch;
using AgroPlatform.Application.GrainStorage.Commands.CreateGrainMovement;
using AgroPlatform.Application.GrainStorage.Commands.SplitGrainBatch;
using AgroPlatform.Application.GrainStorage.Commands.TransferGrain;
using AgroPlatform.Application.GrainStorage.Commands.WriteOffGrainBatch;
using AgroPlatform.Application.GrainStorage.Queries.GetGrainBatches;
using AgroPlatform.Application.GrainStorage.Queries.GetGrainLedger;
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

    /// <summary>Creates a new grain batch (receives grain into storage). Also records an initial Receipt ledger entry.</summary>
    [HttpPost]
    [Authorize(Policy = Permissions.GrainStorage.Manage)]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateGrainBatch([FromBody] CreateGrainBatchCommand command, CancellationToken cancellationToken)
    {
        var id = await _sender.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetGrainBatches), new { }, new { id });
    }

    /// <summary>Adds additional quantity to an existing grain batch (partial/staged receipt).</summary>
    [HttpPost("{id:guid}/receipt")]
    [Authorize(Policy = Permissions.GrainStorage.Manage)]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AddGrainReceipt(Guid id, [FromBody] AddGrainReceiptCommand command, CancellationToken cancellationToken)
    {
        var movementId = await _sender.Send(command with { GrainBatchId = id }, cancellationToken);
        return CreatedAtAction(nameof(GetGrainMovements), new { id }, new { id = movementId });
    }

    /// <summary>Records a grain movement for a specific batch (Receipt, Issue, SaleDispatch, Adjustment, WriteOff).</summary>
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

    /// <summary>Returns a summary of grain across all storages, grouped by grain type.</summary>
    [HttpGet("summary")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetGrainSummary(CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetGrainSummaryQuery(), cancellationToken);
        return Ok(result);
    }

    /// <summary>Returns the paginated grain movement ledger across all batches, with optional filters.</summary>
    [HttpGet("ledger")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetGrainLedger(
        [FromQuery] Guid? storageId,
        [FromQuery] Guid? batchId,
        [FromQuery] string? movementType,
        [FromQuery] DateTime? dateFrom,
        [FromQuery] DateTime? dateTo,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        CancellationToken cancellationToken = default)
    {
        var result = await _sender.Send(
            new GetGrainLedgerQuery(storageId, batchId, movementType, dateFrom, dateTo, page, pageSize),
            cancellationToken);
        return Ok(result);
    }

    /// <summary>Transfers grain between two batches (linked by a shared OperationId). Returns the OperationId.</summary>
    [HttpPost("transfer")]
    [Authorize(Policy = Permissions.GrainStorage.Manage)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> TransferGrain([FromBody] TransferGrainCommand command, CancellationToken cancellationToken)
    {
        var operationId = await _sender.Send(command, cancellationToken);
        return Ok(new { operationId });
    }

    /// <summary>Splits a grain batch: creates a new batch with the specified quantity (linked by OperationId). Returns the new batch id.</summary>
    [HttpPost("split")]
    [Authorize(Policy = Permissions.GrainStorage.Manage)]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SplitGrainBatch([FromBody] SplitGrainBatchCommand command, CancellationToken cancellationToken)
    {
        var newBatchId = await _sender.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetGrainBatches), new { }, new { id = newBatchId });
    }

    /// <summary>Records an inventory adjustment on a grain batch (positive = increase, negative = decrease).</summary>
    [HttpPost("{id:guid}/adjust")]
    [Authorize(Policy = Permissions.GrainStorage.Manage)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AdjustGrainBatch(Guid id, [FromBody] AdjustGrainBatchCommand command, CancellationToken cancellationToken)
    {
        var movementId = await _sender.Send(command with { BatchId = id }, cancellationToken);
        return Ok(new { id = movementId });
    }

    /// <summary>Records a write-off on a grain batch.</summary>
    [HttpPost("{id:guid}/writeoff")]
    [Authorize(Policy = Permissions.GrainStorage.Manage)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> WriteOffGrainBatch(Guid id, [FromBody] WriteOffGrainBatchCommand command, CancellationToken cancellationToken)
    {
        var movementId = await _sender.Send(command with { BatchId = id }, cancellationToken);
        return Ok(new { id = movementId });
    }

    /// <summary>Adds a placement record to an existing grain batch, allowing one batch to span multiple storages.</summary>
    [HttpPost("{id:guid}/placements")]
    [Authorize(Policy = Permissions.GrainStorage.Manage)]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AddGrainBatchPlacement(Guid id, [FromBody] AddGrainBatchPlacementRequest request, CancellationToken cancellationToken)
    {
        var placementId = await _sender.Send(
            new AddGrainBatchPlacementCommand(id, request.GrainStorageId, request.GrainStorageUnitId, request.QuantityTons),
            cancellationToken);
        return Created(string.Empty, new { id = placementId });
    }

    /// <summary>Returns the transfer history for a specific batch.</summary>
    [HttpGet("{id:guid}/transfers")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetGrainTransfers(Guid id, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetGrainTransfersQuery(id), cancellationToken);
        return Ok(result);
    }
}

/// <summary>Request body for adding a placement to a grain batch.</summary>
public record AddGrainBatchPlacementRequest(Guid GrainStorageId, Guid? GrainStorageUnitId, decimal QuantityTons);