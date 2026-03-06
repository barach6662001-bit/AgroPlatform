using AgroPlatform.Application.Warehouses.Commands.CreateWarehouse;
using AgroPlatform.Application.Warehouses.Commands.CreateWarehouseItem;
using AgroPlatform.Application.Warehouses.Commands.InventoryAdjust;
using AgroPlatform.Application.Warehouses.Commands.IssueStock;
using AgroPlatform.Application.Warehouses.Commands.ReceiptStock;
using AgroPlatform.Application.Warehouses.Commands.TransferStock;
using AgroPlatform.Application.Warehouses.Queries.GetBalance;
using AgroPlatform.Application.Warehouses.Queries.GetMoveHistory;
using AgroPlatform.Application.Warehouses.Queries.GetWarehouses;
using AgroPlatform.Application.Warehouses.Queries.GetWarehouseItems;
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
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateWarehouse([FromBody] CreateWarehouseCommand command, CancellationToken cancellationToken)
    {
        var id = await _sender.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetWarehouses), new { }, new { id });
    }

    /// <summary>Returns a list of all warehouses for the current tenant.</summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetWarehouses(CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetWarehousesQuery(), cancellationToken);
        return Ok(result);
    }

    /// <summary>Creates a new stock item (product/material).</summary>
    /// <param name="command">Item creation data.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The ID of the created item.</returns>
    [HttpPost("items")]
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

    /// <summary>Records a stock receipt (incoming delivery) to a warehouse.</summary>
    /// <param name="command">Receipt data.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The ID of the created stock movement record.</returns>
    [HttpPost("receipt")]
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
}
