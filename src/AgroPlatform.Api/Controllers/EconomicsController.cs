using AgroPlatform.Application.Economics.Commands.CreateCostRecord;
using AgroPlatform.Application.Economics.Commands.DeleteCostRecord;
using AgroPlatform.Application.Economics.Queries.GetCostRecords;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgroPlatform.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/economics")]
public class EconomicsController : ControllerBase
{
    private readonly ISender _sender;

    public EconomicsController(ISender sender)
    {
        _sender = sender;
    }

    [HttpPost("cost-records")]
    public async Task<IActionResult> CreateCostRecord([FromBody] CreateCostRecordCommand command, CancellationToken cancellationToken)
    {
        var id = await _sender.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetCostRecords), new { }, new { id });
    }

    [HttpGet("cost-records")]
    public async Task<IActionResult> GetCostRecords(
        [FromQuery] string? category,
        [FromQuery] Guid? fieldId,
        [FromQuery] Guid? agroOperationId,
        [FromQuery] DateTime? dateFrom,
        [FromQuery] DateTime? dateTo,
        CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetCostRecordsQuery(category, fieldId, agroOperationId, dateFrom, dateTo), cancellationToken);
        return Ok(result);
    }

    [HttpDelete("cost-records/{id:guid}")]
    public async Task<IActionResult> DeleteCostRecord(Guid id, CancellationToken cancellationToken)
    {
        await _sender.Send(new DeleteCostRecordCommand(id), cancellationToken);
        return NoContent();
    }
}
