using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Enums;

namespace AgroPlatform.UnitTests.TestDoubles;

public class FakeCurrentUserService : ICurrentUserService
{
    public string? UserId { get; set; } = Guid.NewGuid().ToString();
    public string? UserName { get; set; } = "FakeUser";
    public Guid TenantId { get; set; }
    public UserRole? Role { get; set; }

    public bool IsInRole(UserRole role) => Role == role;
}