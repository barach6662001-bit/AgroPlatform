namespace AgroPlatform.Application.Auth.DTOs;

public record AuthResponse(
    string Token,
    string Email,
    string Role,
    DateTime ExpiresAt,
    Guid TenantId,
    bool RequirePasswordChange,
    bool HasCompletedOnboarding,
    string? FirstName,
    string? LastName,
    string? RefreshToken = null,
    DateTime? RefreshTokenExpiresAt = null
);
