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

[ApiController]
[Authorize]
[Route("api/warehouses")]
public class WarehousesController : ControllerBase
{
    private readonly ISender _sender;

    public WarehousesController(ISender sender)
    {
        _sender = sender;
    }

    [HttpPost]
    public async Task<IActionResult> CreateWarehouse([FromBody] CreateWarehouseCommand command, CancellationToken cancellationToken)
    {
        var id = await _sender.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetWarehouses), new { }, new { id });
    }

    [HttpGet]
    public async Task<IActionResult> GetWarehouses(CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetWarehousesQuery(), cancellationToken);
        return Ok(result);
    }

    [HttpPost("items")]
    public async Task<IActionResult> CreateWarehouseItem([FromBody] CreateWarehouseItemCommand command, CancellationToken cancellationToken)
    {
        var id = await _sender.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetWarehouseItems), new { }, new { id });
    }

    [HttpGet("items")]
    public async Task<IActionResult> GetWarehouseItems([FromQuery] string? category, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetWarehouseItemsQuery(category), cancellationToken);
        return Ok(result);
    }

    [HttpPost("receipt")]
    public async Task<IActionResult> ReceiptStock([FromBody] ReceiptStockCommand command, CancellationToken cancellationToken)
    {
        var id = await _sender.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetWarehouses), new { }, new { id });
    }

    [HttpPost("issue")]
    public async Task<IActionResult> IssueStock([FromBody] IssueStockCommand command, CancellationToken cancellationToken)
    {
        var id = await _sender.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetWarehouses), new { }, new { id });
    }

    [HttpPost("transfer")]
    public async Task<IActionResult> TransferStock([FromBody] TransferStockCommand command, CancellationToken cancellationToken)
    {
        var operationId = await _sender.Send(command, cancellationToken);
        return Ok(new { operationId });
    }

    [HttpPost("inventory")]
    public async Task<IActionResult> InventoryAdjust([FromBody] InventoryAdjustCommand command, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(command, cancellationToken);
        return Ok(result);
    }

    [HttpGet("balances")]
    public async Task<IActionResult> GetBalances([FromQuery] Guid? warehouseId, [FromQuery] Guid? itemId, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetBalanceQuery(warehouseId, itemId), cancellationToken);
        return Ok(result);
    }

    [HttpGet("moves")]
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
