using AgroPlatform.Application.Common.Queries.GetAuditLog;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgroPlatform.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Administrator")]
public class AuditController : ControllerBase
{
    private readonly IMediator _mediator;

    public AuditController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Get audit log entries with optional filtering.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<AuditLogResultDto>> GetAuditLog(
        [FromQuery] string? entityType = null,
        [FromQuery] Guid? userId = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 50
    )
    {
        var query = new GetAuditLogQuery(entityType, userId, fromDate, toDate, pageNumber, pageSize);
        var result = await _mediator.Send(query);
        return Ok(result);
    }
}
