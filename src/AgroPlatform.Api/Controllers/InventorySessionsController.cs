using AgroPlatform.Application.Warehouses.Commands.ApproveInventorySession;
using AgroPlatform.Application.Warehouses.Commands.CompleteInventorySession;
using AgroPlatform.Application.Warehouses.Commands.RecordInventoryCount;
using AgroPlatform.Application.Warehouses.Commands.StartInventorySession;
using AgroPlatform.Application.Warehouses.Commands.SubmitInventorySession;
using AgroPlatform.Application.Warehouses.Queries.GetInventorySessionById;
using AgroPlatform.Application.Warehouses.Queries.GetInventorySessions;
using AgroPlatform.Domain.Authorization;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgroPlatform.Api.Controllers;

/// <summary>Manages inventory counting sessions and their workflow.</summary>
[ApiController]
[Authorize]
[Route("api/inventory-sessions")]
[Produces("application/json")]
public class InventorySessionsController : ControllerBase
{
    private readonly ISender _sender;

    public InventorySessionsController(ISender sender)
    {
        _sender = sender;
    }

    /// <summary>Returns paginated list of inventory sessions.</summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSessions(
        [FromQuery] Guid? warehouseId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var result = await _sender.Send(new GetInventorySessionsQuery(warehouseId, page, pageSize), cancellationToken);
        return Ok(result);
    }

    /// <summary>Returns a single inventory session with all lines.</summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetSession(Guid id, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetInventorySessionByIdQuery(id), cancellationToken);
        return Ok(result);
    }

    /// <summary>Starts a new inventory session for a warehouse, prefilling expected balances.</summary>
    [HttpPost]
    [Authorize(Policy = Permissions.Inventory.Manage)]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<IActionResult> StartSession([FromBody] StartInventorySessionCommand command, CancellationToken cancellationToken)
    {
        var id = await _sender.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetSession), new { id }, new { id });
    }

    /// <summary>Records the counted quantity for an inventory line.</summary>
    [HttpPost("{id:guid}/count")]
    [Authorize(Policy = Permissions.Inventory.Manage)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> RecordCount(Guid id, [FromBody] RecordInventoryCountCommand command, CancellationToken cancellationToken)
    {
        await _sender.Send(command with { SessionId = id }, cancellationToken);
        return NoContent();
    }

    /// <summary>Submits the session for approval (all lines must be counted).</summary>
    [HttpPost("{id:guid}/submit")]
    [Authorize(Policy = Permissions.Inventory.Manage)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Submit(Guid id, CancellationToken cancellationToken)
    {
        await _sender.Send(new SubmitInventorySessionCommand(id), cancellationToken);
        return NoContent();
    }

    /// <summary>Approves the inventory session.</summary>
    [HttpPost("{id:guid}/approve")]
    [Authorize(Policy = Permissions.Inventory.Manage)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Approve(Guid id, CancellationToken cancellationToken)
    {
        await _sender.Send(new ApproveInventorySessionCommand(id), cancellationToken);
        return NoContent();
    }

    /// <summary>Completes the session and generates stock adjustments for discrepancies.</summary>
    [HttpPost("{id:guid}/complete")]
    [Authorize(Policy = Permissions.Inventory.Manage)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Complete(Guid id, CancellationToken cancellationToken)
    {
        await _sender.Send(new CompleteInventorySessionCommand(id), cancellationToken);
        return NoContent();
    }
}
