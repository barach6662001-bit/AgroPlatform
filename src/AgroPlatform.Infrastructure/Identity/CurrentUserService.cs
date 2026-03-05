using System.Security.Claims;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Enums;
using Microsoft.AspNetCore.Http;

namespace AgroPlatform.Infrastructure.Identity;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public string? UserId => _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);

    public string? UserName => _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.Name)
        ?? _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.Email);

    public Guid TenantId
    {
        get
        {
            var context = _httpContextAccessor.HttpContext;
            if (context?.Items.TryGetValue("TenantId", out var tenantIdObj) == true
                && tenantIdObj is Guid tenantId)
            {
                return tenantId;
            }

            var claim = context?.User?.FindFirstValue("TenantId");
            if (Guid.TryParse(claim, out var tenantIdFromClaim))
                return tenantIdFromClaim;

            return Guid.Empty;
        }
    }

    public UserRole? Role
    {
        get
        {
            var roleClaim = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.Role);
            if (Enum.TryParse<UserRole>(roleClaim, out var role))
                return role;
            return null;
        }
    }

    public bool IsInRole(UserRole role) => Role == role;
}
