using AgroPlatform.Application.Sales.Commands.CreateSale;
using AgroPlatform.Application.Sales.Commands.DeleteSale;
using AgroPlatform.Application.Sales.Commands.UpdateSale;
using AgroPlatform.Application.Sales.Queries.GetSaleById;
using AgroPlatform.Application.Sales.Queries.GetSales;
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
        return CreatedAtAction(nameof(GetSaleById), new { id }, new { id });
    }

    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSales(
        [FromQuery] string? buyerName,
        [FromQuery] DateTime? dateFrom,
        [FromQuery] DateTime? dateTo,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var result = await _sender.Send(new GetSalesQuery(buyerName, dateFrom, dateTo, page, pageSize), cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetSaleById(Guid id, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetSaleByIdQuery(id), cancellationToken);
        if (result is null) return NotFound();
        return Ok(result);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Administrator,Manager,Director")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateSale(Guid id, [FromBody] UpdateSaleCommand command, CancellationToken cancellationToken)
    {
        if (id != command.Id) return BadRequest();
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
