using AgroPlatform.Application.Machinery.Commands.AddFuelLog;
using AgroPlatform.Application.Machinery.Commands.AddMaintenance;
using AgroPlatform.Application.Machinery.Commands.AddWorkLog;
using AgroPlatform.Application.Machinery.Commands.CreateMachine;
using AgroPlatform.Application.Machinery.Commands.DeleteMachine;
using AgroPlatform.Application.Machinery.Commands.UpdateMachine;
using AgroPlatform.Application.Machinery.Queries.ExportMaintenanceRecords;
using AgroPlatform.Application.Machinery.Queries.GetGpsTrack;
using AgroPlatform.Application.Machinery.Queries.GetMachineById;
using AgroPlatform.Application.Machinery.Queries.GetMachines;
using AgroPlatform.Application.Machinery.Queries.GetMachineSummary;
using AgroPlatform.Application.Machinery.Queries.GetMaintenanceRecords;
using AgroPlatform.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgroPlatform.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/machinery")]
[Produces("application/json")]
public class MachineryController : ControllerBase
{
    private readonly ISender _sender;

    public MachineryController(ISender sender)
    {
        _sender = sender;
    }

    [HttpPost]
    [Authorize(Roles = "Administrator,Manager")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateMachine([FromBody] CreateMachineCommand command, CancellationToken cancellationToken)
    {
        var id = await _sender.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetMachine), new { id }, new { id });
    }

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

    [HttpGet("summary")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSummary(CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetMachineSummaryQuery(), cancellationToken);
        return Ok(result);
    }

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

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Administrator,Manager")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteMachine(Guid id, CancellationToken cancellationToken)
    {
        await _sender.Send(new DeleteMachineCommand(id), cancellationToken);
        return NoContent();
    }

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

    /// <summary>Returns GPS track points for a machine within the specified time range.</summary>
    [HttpGet("{id:guid}/track")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetTrack(
        Guid id,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        CancellationToken cancellationToken)
    {
        if (from == null || to == null)
            return BadRequest(new { error = "Query parameters 'from' and 'to' are required." });

        if (from.Value > to.Value)
            return BadRequest(new { error = "Parameter 'from' must not be later than 'to'." });

        var result = await _sender.Send(new GetGpsTrackQuery(id, from.Value, to.Value), cancellationToken);

        if (result == null)
            return NotFound();

        return Ok(result);
    }

    /// <summary>Returns maintenance records for a machine.</summary>
    [HttpGet("{id:guid}/maintenance")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMaintenance(Guid id, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetMaintenanceRecordsQuery(id), cancellationToken);
        return Ok(result);
    }

    /// <summary>Exports maintenance records for a machine as a CSV file.</summary>
    [HttpGet("{id:guid}/maintenance/export")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> ExportMaintenance(Guid id, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new ExportMaintenanceRecordsQuery(id), cancellationToken);
        return File(result.Content, result.ContentType, result.FileName);
    }

    /// <summary>Records a maintenance event for a machine.</summary>
    [HttpPost("{id:guid}/maintenance")]
    [Authorize(Roles = "Administrator,Manager")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<IActionResult> AddMaintenance(Guid id, [FromBody] AddMaintenanceCommand command, CancellationToken cancellationToken)
    {
        if (id != command.MachineId)
            return BadRequest();

        var recordId = await _sender.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetMachine), new { id }, new { id = recordId });
    }
}
