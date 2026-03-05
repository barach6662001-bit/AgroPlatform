using AgroPlatform.Domain.Enums;

namespace AgroPlatform.Application.Common.Interfaces;

public interface ICurrentUserService
{
    string? UserId { get; }
    string? UserName { get; }
    Guid TenantId { get; }
    UserRole? Role { get; }
    bool IsInRole(UserRole role);
}
