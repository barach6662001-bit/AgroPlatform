using AgroPlatform.Domain.Common;

namespace AgroPlatform.Domain.Users;

/// <summary>
/// API Key for programmatic access to AgroPlatform APIs.
/// Supports scoped permissions and token revocation.
/// </summary>
public class ApiKey : AuditableEntity
{
    /// <summary>Hashed API key value (SHA256).</summary>
    public required string KeyHash { get; set; }

    /// <summary>Tenant this API key belongs to.</summary>
    public new Guid TenantId { get; set; }

    /// <summary>Human-readable name for this key.</summary>
    public required string Name { get; set; }

    /// <summary>
    /// Scopes (comma-separated or JSON array).
    /// Examples: "read:operations,write:costs" or "read:*"
    /// </summary>
    public required string Scopes { get; set; }

    /// <summary>When this key expires (null = never).</summary>
    public DateTime? ExpiresAtUtc { get; set; }

    /// <summary>Last time this key was used to authenticate a request.</summary>
    public DateTime? LastUsedAtUtc { get; set; }

    /// <summary>Whether this key has been revoked and cannot be used.</summary>
    public bool IsRevoked { get; set; }

    /// <summary>Rate limit per hour (null = unlimited).</summary>
    public int? RateLimitPerHour { get; set; }

    /// <summary>Allowed webhook event types (comma-separated).</summary>
    public string? WebhookEventTypes { get; set; }

    /// <summary>Webhook URL to notify on events.</summary>
    public string? WebhookUrl { get; set; }
}
