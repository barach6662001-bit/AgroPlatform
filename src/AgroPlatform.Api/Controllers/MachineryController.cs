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
using Microsoft.AspNetCore.Mvc;

namespace AgroPlatform.Api.Controllers;

[ApiController]
[Route("api/machinery")]
public class MachineryController : ControllerBase
{
    private readonly ISender _sender;

    public MachineryController(ISender sender)
    {
        _sender = sender;
    }

    [HttpPost]
    public async Task<IActionResult> CreateMachine([FromBody] CreateMachineCommand command, CancellationToken cancellationToken)
    {
        var id = await _sender.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetMachine), new { id }, new { id });
    }

    [HttpGet]
    public async Task<IActionResult> GetMachines(
        [FromQuery] MachineryType? type,
        [FromQuery] MachineryStatus? status,
        [FromQuery] string? search,
        CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetMachinesQuery(type, status, search), cancellationToken);
        return Ok(result);
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary(CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetMachineSummaryQuery(), cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetMachine(Guid id, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetMachineByIdQuery(id), cancellationToken);
        if (result == null)
            return NotFound();
        return Ok(result);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateMachine(Guid id, [FromBody] UpdateMachineCommand command, CancellationToken cancellationToken)
    {
        if (id != command.Id)
            return BadRequest();

        await _sender.Send(command, cancellationToken);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteMachine(Guid id, CancellationToken cancellationToken)
    {
        await _sender.Send(new DeleteMachineCommand(id), cancellationToken);
        return NoContent();
    }

    [HttpPost("{id:guid}/work-logs")]
    public async Task<IActionResult> AddWorkLog(Guid id, [FromBody] AddWorkLogCommand command, CancellationToken cancellationToken)
    {
        if (id != command.MachineId)
            return BadRequest();

        var logId = await _sender.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetMachine), new { id }, new { id = logId });
    }

    [HttpPost("{id:guid}/fuel-logs")]
    public async Task<IActionResult> AddFuelLog(Guid id, [FromBody] AddFuelLogCommand command, CancellationToken cancellationToken)
    {
        if (id != command.MachineId)
            return BadRequest();

        var logId = await _sender.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetMachine), new { id }, new { id = logId });
    }
}
