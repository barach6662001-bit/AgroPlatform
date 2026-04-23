namespace AgroPlatform.Application.Common.Interfaces;

public interface ISuperAdminAuditService
{
    /// <summary>
    /// Persists one audit entry. <paramref name="before"/> and <paramref name="after"/> are
    /// serialized to JSON by the caller (usually <see cref="System.Text.Json.JsonSerializer"/>).
    /// </summary>
    Task LogAsync(
        string action,
        string? targetType,
        string? targetId,
        object? before,
        object? after,
        CancellationToken cancellationToken = default);
}
