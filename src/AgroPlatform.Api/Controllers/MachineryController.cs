using AgroPlatform.Application.Machinery.Commands.AddFuelLog;
using AgroPlatform.Application.Machinery.Commands.AddWorkLog;
using AgroPlatform.Application.Machinery.Commands.CreateMachine;
using AgroPlatform.Application.Machinery.Commands.DeleteMachine;
using AgroPlatform.Application.Machinery.Commands.UpdateMachine;
using AgroPlatform.Application.Machinery.Queries.GetMachineById;
using AgroPlatform.Application.Machinery.Queries.GetMachines;
using AgroPlatform.Application.Machinery.Queries.GetMachineSummary;
using AgroPlatform.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgroPlatform.Api.Controllers;

/// <summary>
/// Manages the machinery fleet — tractors, combines and other agricultural equipment.
/// Supports work-hour logging, fuel logging and fleet summary reporting.
/// </summary>
[ApiController]
[Authorize]
[Route("api/machinery")]
[Produces("application/json")]
public class MachineryController : ControllerBase
{
    private readonly ISender _sender;

    /// <summary>Initializes a new instance of <see cref="MachineryController"/>.</summary>
    public MachineryController(ISender sender)
    {
        _sender = sender;
    }

    /// <summary>Adds a new machine to the fleet.</summary>
    /// <param name="command">Machine creation data (name, type, year).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The ID of the created machine.</returns>
    [HttpPost]
    [Authorize(Roles = "Administrator,Manager")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateMachine([FromBody] CreateMachineCommand command, CancellationToken cancellationToken)
    {
        var id = await _sender.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetMachine), new { id }, new { id });
    }

    /// <summary>Returns a paginated list of machines, optionally filtered by type, status or search text.</summary>
    /// <param name="type">Optional machinery type filter.</param>
    /// <param name="status">Optional machinery status filter.</param>
    /// <param name="search">Optional free-text search (name).</param>
    /// <param name="page">Page number (1-based, default 1).</param>
    /// <param name="pageSize">Page size (default 20).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMachines(
        [FromQuery] MachineryType? type,
        [FromQuery] MachineryStatus? status,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var result = await _sender.Send(new GetMachinesQuery(type, status, search, page, pageSize), cancellationToken);
        return Ok(result);
    }

    /// <summary>Returns an aggregated summary of the entire machinery fleet.</summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    [HttpGet("summary")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSummary(CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetMachineSummaryQuery(), cancellationToken);
        return Ok(result);
    }

    /// <summary>Returns detailed information about a single machine.</summary>
    /// <param name="id">Machine ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetMachine(Guid id, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetMachineByIdQuery(id), cancellationToken);
        if (result == null)
            return NotFound();
        return Ok(result);
    }

    /// <summary>Updates machine data (name, type, status, year).</summary>
    /// <param name="id">Machine ID (must match the ID in the request body).</param>
    /// <param name="command">Updated machine data.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Administrator,Manager")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateMachine(Guid id, [FromBody] UpdateMachineCommand command, CancellationToken cancellationToken)
    {
        if (id != command.Id)
            return BadRequest();

        await _sender.Send(command, cancellationToken);
        return NoContent();
    }

    /// <summary>Soft-deletes a machine from the fleet.</summary>
    /// <param name="id">Machine ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Administrator,Manager")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteMachine(Guid id, CancellationToken cancellationToken)
    {
        await _sender.Send(new DeleteMachineCommand(id), cancellationToken);
        return NoContent();
    }

    /// <summary>Records a work-hours entry for a machine.</summary>
    /// <param name="id">Machine ID (must match <c>MachineId</c> in the request body).</param>
    /// <param name="command">Work-log data (date, hours worked).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The ID of the created work-log entry.</returns>
    [HttpPost("{id:guid}/work-logs")]
    [Authorize(Roles = "Administrator,Manager")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<IActionResult> AddWorkLog(Guid id, [FromBody] AddWorkLogCommand command, CancellationToken cancellationToken)
    {
        if (id != command.MachineId)
            return BadRequest();

        var logId = await _sender.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetMachine), new { id }, new { id = logId });
    }

    /// <summary>Records a fuel-filling entry for a machine.</summary>
    /// <param name="id">Machine ID (must match <c>MachineId</c> in the request body).</param>
    /// <param name="command">Fuel-log data (date, litres, cost).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The ID of the created fuel-log entry.</returns>
    [HttpPost("{id:guid}/fuel-logs")]
    [Authorize(Roles = "Administrator,Manager")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<IActionResult> AddFuelLog(Guid id, [FromBody] AddFuelLogCommand command, CancellationToken cancellationToken)
    {
        if (id != command.MachineId)
            return BadRequest();

        var logId = await _sender.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetMachine), new { id }, new { id = logId });
    }
}
