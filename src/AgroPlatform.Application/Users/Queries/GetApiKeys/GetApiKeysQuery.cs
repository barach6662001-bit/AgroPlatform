using MediatR;

namespace AgroPlatform.Application.Users.Queries.GetApiKeys;

/// <summary>Query to retrieve all active API keys for a tenant.</summary>
public record GetApiKeysQuery(Guid TenantId) : IRequest<List<ApiKeyDto>>;

/// <summary>API Key DTO for frontend consumption.</summary>
public record ApiKeyDto(
    Guid Id,
    string Name,
    string Scopes,
    DateTime? ExpiresAtUtc,
    DateTime? LastUsedAtUtc,
    bool IsRevoked,
    int? RateLimitPerHour,
    DateTime CreatedAtUtc
);
