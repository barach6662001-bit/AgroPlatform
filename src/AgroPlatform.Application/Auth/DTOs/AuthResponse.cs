namespace AgroPlatform.Application.Auth.DTOs;

public record AuthResponse(
    string Token,
    string Email,
    string Role,
    DateTime ExpiresAt,
    Guid TenantId
);
