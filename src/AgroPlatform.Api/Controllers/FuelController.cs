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

/// <summary>
/// Manages fuel tanks, fuel supply receipts, and fuel issue transactions.
/// </summary>
[ApiController]
[Authorize]
[Route("api/fuel")]
[Produces("application/json")]
public class FuelController : ControllerBase
{
    private readonly ISender _sender;

    /// <summary>Initializes a new instance of <see cref="FuelController"/>.</summary>
    public FuelController(ISender sender)
    {
        _sender = sender;
    }

    /// <summary>Returns the list of fuel tanks with current levels.</summary>
    [HttpGet("tanks")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetFuelTanks(CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetFuelTanksQuery(), cancellationToken);
        return Ok(result);
    }

    /// <summary>Creates a new fuel tank.</summary>
    [HttpPost("tanks")]
    [Authorize(Roles = "Administrator,Manager")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateFuelTank([FromBody] CreateFuelTankRequest request, CancellationToken cancellationToken)
    {
        var command = new CreateFuelTankCommand(request.Name, (FuelType)request.FuelType, request.CapacityLiters);
        var id = await _sender.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetFuelTanks), new { }, new { id });
    }

    /// <summary>Records a fuel supply (receipt) to a tank.</summary>
    [HttpPost("supply")]
    [Authorize(Roles = "Administrator,Manager,Storekeeper")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateFuelSupply([FromBody] CreateFuelSupplyCommand command, CancellationToken cancellationToken)
    {
        var id = await _sender.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetFuelTransactions), new { }, new { id });
    }

    /// <summary>Records a fuel issue (dispensing) from a tank.</summary>
    [HttpPost("issue")]
    [Authorize(Roles = "Administrator,Manager,Storekeeper")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateFuelIssue([FromBody] CreateFuelIssueCommand command, CancellationToken cancellationToken)
    {
        var id = await _sender.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetFuelTransactions), new { }, new { id });
    }

    /// <summary>Returns the fuel transaction journal with optional filters.</summary>
    [HttpGet("transactions")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetFuelTransactions(
        [FromQuery] Guid? tankId,
        [FromQuery] DateTime? dateFrom,
        [FromQuery] DateTime? dateTo,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        CancellationToken cancellationToken = default)
    {
        var result = await _sender.Send(new GetFuelTransactionsQuery(tankId, dateFrom, dateTo, page, pageSize), cancellationToken);
        return Ok(result);
    }
}

public record CreateFuelTankRequest(
    string Name,
    int FuelType,
    decimal CapacityLiters
);
