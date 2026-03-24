using MediatR;

namespace AgroPlatform.Application.Users.Commands.CreateApiKey;

/// <summary>Command to create a new API key.</summary>
public record CreateApiKeyCommand(
    Guid TenantId,
    string Name,
    string Scopes,
    DateTime? ExpiresAtUtc = null,
    int? RateLimitPerHour = null,
    string? WebhookUrl = null,
    string? WebhookEventTypes = null
) : IRequest<CreateApiKeyResult>;

/// <summary>Result containing the newly created API key (key only returned once).</summary>
public record CreateApiKeyResult(
    Guid Id,
    string Key,
    string Name,
    string Scopes,
    DateTime CreatedAtUtc
);
