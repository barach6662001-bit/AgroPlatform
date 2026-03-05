using AgroPlatform.Application.Common.Interfaces;
using Microsoft.AspNetCore.Http;

namespace AgroPlatform.Infrastructure.Services;

public class TenantService : ITenantService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public TenantService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public Guid GetTenantId()
    {
        var context = _httpContextAccessor.HttpContext;
        if (context?.Items.TryGetValue("TenantId", out var tenantIdObj) == true
            && tenantIdObj is Guid tenantId)
        {
            return tenantId;
        }

        return Guid.Empty;
    }
}
