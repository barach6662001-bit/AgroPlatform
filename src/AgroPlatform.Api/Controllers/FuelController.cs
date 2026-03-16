using AgroPlatform.Application.Fuel.Commands.CreateFuelIssue;
using AgroPlatform.Application.Fuel.Commands.CreateFuelSupply;
using AgroPlatform.Application.Fuel.Commands.CreateFuelTank;
using AgroPlatform.Application.Fuel.Queries.GetFuelTanks;
using AgroPlatform.Application.Fuel.Queries.GetFuelTransactions;
using AgroPlatform.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgroPlatform.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/fuel")]
[Produces("application/json")]
public class FuelController : ControllerBase
{
    private readonly ISender _sender;

    public FuelController(ISender sender) => _sender = sender;

    [HttpGet("tanks")]
    public async Task<IActionResult> GetTanks(CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetFuelTanksQuery(), cancellationToken);
        return Ok(result);
    }

    [HttpPost("tanks")]
    [Authorize(Roles = "Administrator,Manager")]
    public async Task<IActionResult> CreateTank([FromBody] CreateFuelTankCommand command, CancellationToken cancellationToken)
    {
        var id = await _sender.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetTanks), new { id }, new { id });
    }

    [HttpPost("supply")]
    [Authorize(Roles = "Administrator,Manager,Storekeeper")]
    public async Task<IActionResult> CreateSupply([FromBody] CreateFuelSupplyCommand command, CancellationToken cancellationToken)
    {
        var id = await _sender.Send(command, cancellationToken);
        return Ok(new { id });
    }

    [HttpPost("issue")]
    [Authorize(Roles = "Administrator,Manager,Storekeeper")]
    public async Task<IActionResult> CreateIssue([FromBody] CreateFuelIssueCommand command, CancellationToken cancellationToken)
    {
        var id = await _sender.Send(command, cancellationToken);
        return Ok(new { id });
    }

    [HttpGet("transactions")]
    public async Task<IActionResult> GetTransactions(
        [FromQuery] Guid? tankId,
        [FromQuery] DateTime? dateFrom,
        [FromQuery] DateTime? dateTo,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var result = await _sender.Send(
            new GetFuelTransactionsQuery(tankId, dateFrom, dateTo, page, pageSize),
            cancellationToken);
        return Ok(result);
    }
}
