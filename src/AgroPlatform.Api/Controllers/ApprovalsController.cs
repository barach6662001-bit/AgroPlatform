using AgroPlatform.Application.Approval.Commands.CreateApprovalRule;
using AgroPlatform.Application.Approval.Commands.DecideApproval;
using AgroPlatform.Application.Approval.Commands.DeleteApprovalRule;
using AgroPlatform.Application.Approval.Commands.UpdateApprovalRule;
using AgroPlatform.Application.Approval.Queries.GetApprovalRules;
using AgroPlatform.Application.Approval.Queries.GetPendingApprovals;
using AgroPlatform.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgroPlatform.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/approvals")]
[Produces("application/json")]
public class ApprovalsController : ControllerBase
{
    private readonly ISender _sender;

    public ApprovalsController(ISender sender)
    {
        _sender = sender;
    }

    /// <summary>Get all approval rules.</summary>
    [HttpGet("rules")]
    public async Task<IActionResult> GetRules(CancellationToken ct)
    {
        var rules = await _sender.Send(new GetApprovalRulesQuery(), ct);
        return Ok(rules);
    }

    /// <summary>Create a new approval rule.</summary>
    [HttpPost("rules")]
    [Authorize(Roles = "SuperAdmin,CompanyAdmin,Manager,Administrator,Admin")]
    public async Task<IActionResult> CreateRule([FromBody] CreateApprovalRuleCommand command, CancellationToken ct)
    {
        var id = await _sender.Send(command, ct);
        return CreatedAtAction(nameof(GetRules), new { id }, new { id });
    }

    /// <summary>Update an existing approval rule.</summary>
    [HttpPut("rules/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,CompanyAdmin,Manager,Administrator,Admin")]
    public async Task<IActionResult> UpdateRule(Guid id, [FromBody] UpdateApprovalRuleCommand command, CancellationToken ct)
    {
        if (id != command.Id)
            return BadRequest("Route id does not match body id.");

        await _sender.Send(command, ct);
        return NoContent();
    }

    /// <summary>Delete an approval rule.</summary>
    [HttpDelete("rules/{id:guid}")]
    [Authorize(Roles = "SuperAdmin,CompanyAdmin,Manager,Administrator,Admin")]
    public async Task<IActionResult> DeleteRule(Guid id, CancellationToken ct)
    {
        await _sender.Send(new DeleteApprovalRuleCommand(id), ct);
        return NoContent();
    }

    /// <summary>Get pending approval requests.</summary>
    [HttpGet("pending")]
    public async Task<IActionResult> GetPending(CancellationToken ct)
    {
        var items = await _sender.Send(new GetPendingApprovalsQuery(), ct);
        return Ok(items);
    }

    /// <summary>Get all approval requests (any status).</summary>
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] ApprovalStatus? status, CancellationToken ct)
    {
        var items = await _sender.Send(new GetPendingApprovalsQuery(status), ct);
        return Ok(items);
    }

    /// <summary>Approve an approval request.</summary>
    [HttpPost("{id:guid}/approve")]
    [Authorize(Roles = "SuperAdmin,CompanyAdmin,Manager,Administrator,Admin")]
    public async Task<IActionResult> Approve(Guid id, CancellationToken ct)
    {
        var result = await _sender.Send(new DecideApprovalCommand(id, true), ct);
        return Ok(new { status = result.ToString() });
    }

    /// <summary>Reject an approval request.</summary>
    [HttpPost("{id:guid}/reject")]
    [Authorize(Roles = "SuperAdmin,CompanyAdmin,Manager,Administrator,Admin")]
    public async Task<IActionResult> Reject(Guid id, [FromBody] RejectRequest? body, CancellationToken ct)
    {
        var result = await _sender.Send(new DecideApprovalCommand(id, false, body?.Reason), ct);
        return Ok(new { status = result.ToString() });
    }
}

public record RejectRequest(string? Reason);
