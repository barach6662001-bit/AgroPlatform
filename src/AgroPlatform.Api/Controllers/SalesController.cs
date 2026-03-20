using AgroPlatform.Application.Economics.Commands.CreateSale;
using AgroPlatform.Application.Economics.Commands.DeleteSale;
using AgroPlatform.Application.Economics.Commands.UpdateSale;
using AgroPlatform.Application.Economics.DTOs;
using AgroPlatform.Application.Economics.Queries.GetSaleKpis;
using AgroPlatform.Application.Economics.Queries.GetSales;
using AgroPlatform.Application.Common.Models;
using AgroPlatform.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgroPlatform.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/sales")]
[Produces("application/json")]
public class SalesController : ControllerBase
{
    private readonly ISender _sender;

    public SalesController(ISender sender)
    {
        _sender = sender;
    }

    [HttpPost]
    [Authorize(Roles = "Administrator,Manager,Director")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateSale([FromBody] CreateSaleCommand command, CancellationToken cancellationToken)
    {
        var id = await _sender.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetSales), new { }, new { id });
    }

    [HttpGet]
    [ProducesResponseType(typeof(PaginatedResult<SaleDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSales(
        [FromQuery] string? buyerName,
        [FromQuery] CropType? cropType,
        [FromQuery] PaymentStatus? paymentStatus,
        [FromQuery] DateTime? dateFrom,
        [FromQuery] DateTime? dateTo,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var result = await _sender.Send(
            new GetSalesQuery(buyerName, cropType, paymentStatus, dateFrom, dateTo, page, pageSize),
            cancellationToken);
        return Ok(result);
    }

    [HttpGet("kpis")]
    [ProducesResponseType(typeof(SaleKpiDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSaleKpis(
        [FromQuery] DateTime? dateFrom,
        [FromQuery] DateTime? dateTo,
        CancellationToken cancellationToken = default)
    {
        var result = await _sender.Send(new GetSaleKpisQuery(dateFrom, dateTo), cancellationToken);
        return Ok(result);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Administrator,Manager,Director")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateSale(Guid id, [FromBody] UpdateSaleCommand command, CancellationToken cancellationToken)
    {
        if (id != command.Id)
            return BadRequest();

        await _sender.Send(command, cancellationToken);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Administrator,Manager,Director")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteSale(Guid id, CancellationToken cancellationToken)
    {
        await _sender.Send(new DeleteSaleCommand(id), cancellationToken);
        return NoContent();
    }
}
