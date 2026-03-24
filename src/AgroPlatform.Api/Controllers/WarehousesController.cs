using AgroPlatform.Application.Warehouses.Commands.CreateWarehouse;
using AgroPlatform.Application.Warehouses.Commands.CreateWarehouseItem;
using AgroPlatform.Application.Warehouses.Commands.InventoryAdjust;
using AgroPlatform.Application.Warehouses.Commands.UpdateWarehouseItem;
using AgroPlatform.Application.Warehouses.Commands.IssueStock;
using AgroPlatform.Application.Warehouses.Commands.ReceiptStock;
using AgroPlatform.Application.Warehouses.Commands.TransferStock;
using AgroPlatform.Application.Warehouses.Queries.GetBalance;
using AgroPlatform.Application.Warehouses.Queries.GetMoveHistory;
using AgroPlatform.Application.Warehouses.Queries.GetWarehouses;
using AgroPlatform.Application.Warehouses.Queries.GetWarehouseItems;
using AgroPlatform.Application.Warehouses.Queries.ExportBalances;
using AgroPlatform.Domain.Authorization;
using AgroPlatform.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgroPlatform.Api.Controllers;

/// <summary>
/// Manages warehouses, stock items, stock movements (receipt, issue, transfer)
/// and inventory adjustments.
/// </summary>
[ApiController]
[Authorize]
[Route("api/warehouses")]
[Produces("application/json")]
public class WarehousesController : ControllerBase
{
    private readonly ISender _sender;

    /// <summary>Initializes a new instance of <see cref="WarehousesController"/>.</summary>
    public WarehousesController(ISender sender)
    {
        _sender = sender;
    }

    /// <summary>Creates a new warehouse.</summary>
    /// <param name="command">Warehouse creation data.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The ID of the created warehouse.</returns>
    [HttpPost]
    [Authorize(Policy = Permissions.Warehouses.Manage)]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateWarehouse([FromBody] CreateWarehouseCommand command, CancellationToken cancellationToken)
    {
        var id = await _sender.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetWarehouses), new { }, new { id });
    }

    /// <summary>Returns a paginated list of warehouses for the current tenant.</summary>
    /// <param name="page">Page number (1-based, default 1).</param>
    /// <param name="pageSize">Page size (default 20).</param>
    /// <param name="type">Optional warehouse type filter.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetWarehouses(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] int? type = null,
        CancellationToken cancellationToken = default)
    {
        var result = await _sender.Send(new GetWarehousesQuery(page, pageSize, type), cancellationToken);
        return Ok(result);
    }

    /// <summary>Creates a new stock item (product/material).</summary>
    /// <param name="command">Item creation data.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The ID of the created item.</returns>
    [HttpPost("items")]
    [Authorize(Policy = Permissions.Warehouses.Manage)]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateWarehouseItem([FromBody] CreateWarehouseItemCommand command, CancellationToken cancellationToken)
    {
        var id = await _sender.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetWarehouseItems), new { }, new { id });
    }

    /// <summary>Returns a paginated list of stock items, optionally filtered by category.</summary>
    /// <param name="category">Optional category filter.</param>
    /// <param name="page">Page number (1-based, default 1).</param>
    /// <param name="pageSize">Page size (default 20).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    [HttpGet("items")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetWarehouseItems([FromQuery] string? category, [FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken cancellationToken = default)
    {
        var result = await _sender.Send(new GetWarehouseItemsQuery(category, page, pageSize), cancellationToken);
        return Ok(result);
    }

    /// <summary>Updates an existing stock item.</summary>
    /// <param name="id">The ID of the item to update.</param>
    /// <param name="command">Updated item data.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    [HttpPut("items/{id:guid}")]
    [Authorize(Policy = Permissions.Warehouses.Manage)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateWarehouseItem(Guid id, [FromBody] UpdateWarehouseItemCommand command, CancellationToken cancellationToken)
    {
        await _sender.Send(command with { Id = id }, cancellationToken);
        return NoContent();
    }

    /// <summary>Records a stock receipt (incoming delivery) to a warehouse.</summary>
    /// <param name="command">Receipt data.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The ID of the created stock movement record.</returns>
    [HttpPost("receipt")]
    [Authorize(Policy = Permissions.Inventory.Manage)]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<IActionResult> ReceiptStock([FromBody] ReceiptStockCommand command, CancellationToken cancellationToken)
    {
        var id = await _sender.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetWarehouses), new { }, new { id });
    }

    /// <summary>Records a stock issue (outgoing dispatch) from a warehouse.</summary>
    /// <param name="command">Issue data.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The ID of the created stock movement record.</returns>
    [HttpPost("issue")]
    [Authorize(Policy = Permissions.Inventory.Manage)]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<IActionResult> IssueStock([FromBody] IssueStockCommand command, CancellationToken cancellationToken)
    {
        var id = await _sender.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetWarehouses), new { }, new { id });
    }

    /// <summary>Transfers stock between two warehouses.</summary>
    /// <param name="command">Transfer data (source warehouse, target warehouse, item, quantity).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The operation ID of the transfer.</returns>
    [HttpPost("transfer")]
    [Authorize(Policy = Permissions.Inventory.Manage)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> TransferStock([FromBody] TransferStockCommand command, CancellationToken cancellationToken)
    {
        var operationId = await _sender.Send(command, cancellationToken);
        return Ok(new { operationId });
    }

    /// <summary>Performs an inventory adjustment for a warehouse item.</summary>
    /// <param name="command">Adjustment data (item, counted quantity).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    [HttpPost("inventory")]
    [Authorize(Policy = Permissions.Inventory.Manage)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> InventoryAdjust([FromBody] InventoryAdjustCommand command, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(command, cancellationToken);
        return Ok(result);
    }

    /// <summary>Returns paginated current stock balances, optionally filtered by warehouse and/or item.</summary>
    /// <param name="warehouseId">Optional warehouse filter.</param>
    /// <param name="itemId">Optional item filter.</param>
    /// <param name="page">Page number (1-based, default 1).</param>
    /// <param name="pageSize">Page size (default 20).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    [HttpGet("balances")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetBalances([FromQuery] Guid? warehouseId, [FromQuery] Guid? itemId, [FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken cancellationToken = default)
    {
        var result = await _sender.Send(new GetBalanceQuery(warehouseId, itemId, page, pageSize), cancellationToken);
        return Ok(result);
    }

    /// <summary>
    /// Returns the paginated history of stock movements, filtered by various criteria.
    /// </summary>
    /// <param name="warehouseId">Optional warehouse filter.</param>
    /// <param name="itemId">Optional item filter.</param>
    /// <param name="dateFrom">Start of the date range (inclusive).</param>
    /// <param name="dateTo">End of the date range (inclusive).</param>
    /// <param name="moveType">Optional movement type filter.</param>
    /// <param name="page">Page number (1-based, default 1).</param>
    /// <param name="pageSize">Page size (default 20).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    [HttpGet("moves")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMoveHistory(
        [FromQuery] Guid? warehouseId,
        [FromQuery] Guid? itemId,
        [FromQuery] DateTime? dateFrom,
        [FromQuery] DateTime? dateTo,
        [FromQuery] StockMoveType? moveType,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var result = await _sender.Send(
            new GetMoveHistoryQuery(warehouseId, itemId, dateFrom, dateTo, moveType, page, pageSize),
            cancellationToken);
        return Ok(result);
    }
    /// <summary>Exports current stock balances as CSV file.</summary>
    [HttpGet("balances/export")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> ExportBalances(
        [FromQuery] Guid? warehouseId,
        CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new ExportBalancesQuery(warehouseId), cancellationToken);
        return File(result.Content, result.ContentType, result.FileName);
    }
}