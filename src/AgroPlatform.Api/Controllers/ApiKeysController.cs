using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MediatR;
using AgroPlatform.Application.Users.Queries.GetApiKeys;
using AgroPlatform.Application.Users.Commands.CreateApiKey;
using AgroPlatform.Application.Users.Commands.RevokeApiKey;

namespace AgroPlatform.Api.Controllers;

/// <summary>
/// API endpoints for managing API keys (per-tenant access).
/// </summary>
[ApiController]
[Route("api/api-keys")]
[Authorize(Policy = "Admin.Manage")]
public class ApiKeysController : ControllerBase
{
    private readonly IMediator _mediator;

    public ApiKeysController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>Get all API keys for the current tenant.</summary>
    [HttpGet]
    public async Task<ActionResult<List<ApiKeyDto>>> GetApiKeys()
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?
            ?? throw new UnauthorizedAccessException("Tenant ID not set.");

        var query = new GetApiKeysQuery(tenantId);
        var result = await _mediator.Send(query);

        return Ok(result);
    }

    /// <summary>Create a new API key.</summary>
    [HttpPost]
    public async Task<ActionResult<CreateApiKeyResult>> CreateApiKey(CreateApiKeyCommand command)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?
            ?? throw new UnauthorizedAccessException("Tenant ID not set.");

        var cmd = new CreateApiKeyCommand(
            tenantId,
            command.Name,
            command.Scopes,
            command.ExpiresAtUtc,
            command.RateLimitPerHour,
            command.WebhookUrl,
            command.WebhookEventTypes
        );

        var result = await _mediator.Send(cmd);
        return CreatedAtAction(nameof(GetApiKeys), result);
    }

    /// <summary>Revoke an API key.</summary>
    [HttpPost("{apiKeyId:guid}/revoke")]
    public async Task<IActionResult> RevokeApiKey(Guid apiKeyId)
    {
        var tenantId = HttpContext.Items["TenantId"] as Guid?
            ?? throw new UnauthorizedAccessException("Tenant ID not set.");

        var command = new RevokeApiKeyCommand(tenantId, apiKeyId);
        await _mediator.Send(command);

        return NoContent();
    }
}
