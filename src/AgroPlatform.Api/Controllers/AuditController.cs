using AgroPlatform.Application.AuditLog.Queries.GetAuditLogs;
using AgroPlatform.Domain.Authorization;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgroPlatform.Api.Controllers;

/// <summary>
/// Provides access to the system audit log.
/// </summary>
[ApiController]
[Authorize(Policy = Permissions.Admin.Manage)]
[Route("api/audit")]
[Produces("application/json")]
public class AuditController : ControllerBase
{
    private readonly ISender _sender;

    /// <summary>Initializes a new instance of <see cref="AuditController"/>.</summary>
    public AuditController(ISender sender)
    {
        _sender = sender;
    }

    /// <summary>Returns a paginated, filtered list of audit log entries.</summary>
    /// <param name="userId">Optional filter by user ID (partial match).</param>
    /// <param name="dateFrom">Start of the date range (inclusive).</param>
    /// <param name="dateTo">End of the date range (inclusive).</param>
    /// <param name="entityType">Optional filter by entity type (exact match).</param>
    /// <param name="action">Optional filter by action (Created / Updated / Deleted).</param>
    /// <param name="page">Page number (1-based, default 1).</param>
    /// <param name="pageSize">Page size (default 50).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAuditLogs(
        [FromQuery] string? userId,
        [FromQuery] DateTime? dateFrom,
        [FromQuery] DateTime? dateTo,
        [FromQuery] string? entityType,
        [FromQuery] string? action,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        CancellationToken cancellationToken = default)
    {
        var result = await _sender.Send(
            new GetAuditLogsQuery(userId, dateFrom, dateTo, entityType, action, page, pageSize),
            cancellationToken);
        return Ok(result);
    }
}
