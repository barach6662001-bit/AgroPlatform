using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;

namespace AgroPlatform.Api.Middleware;

/// <summary>
/// Ensures that authenticated non-SuperAdmin users cannot access data belonging to a different
/// tenant by spoofing the <c>X-Tenant-Id</c> header.
/// SuperAdmin (TenantId = Guid.Empty) can operate across all tenants.
/// </summary>
public class TenantAuthorizationMiddleware
{
    private readonly RequestDelegate _next;

    public TenantAuthorizationMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var user = context.User;

        if (user?.Identity?.IsAuthenticated == true)
        {
            var authType = user.FindFirstValue("auth_type");
            if (!string.Equals(authType, "ApiKey", StringComparison.OrdinalIgnoreCase))
            {
                var roleClaim = user.FindFirstValue(ClaimTypes.Role);

                // SuperAdmin bypasses all tenant cross-checks
                if (roleClaim != "SuperAdmin")
                {
                    var jwtTenantIdStr = user.FindFirstValue("TenantId");

                    if (context.Items.TryGetValue("TenantId", out var requestTenantIdObj)
                        && requestTenantIdObj is Guid requestTenantId
                        && Guid.TryParse(jwtTenantIdStr, out var jwtTenantId)
                        && requestTenantId != jwtTenantId)
                    {
                        await WriteForbiddenAsync(context);
                        return;
                    }
                }
            }
        }

        await _next(context);
    }

    private static async Task WriteForbiddenAsync(HttpContext context)
    {
        var problem = new ProblemDetails
        {
            Type = "https://tools.ietf.org/html/rfc7231#section-6.5.3",
            Title = "Forbidden",
            Status = StatusCodes.Status403Forbidden,
            Detail = "Access to the requested tenant is not authorized.",
            Instance = context.Request.Path
        };

        context.Response.StatusCode = StatusCodes.Status403Forbidden;
        context.Response.ContentType = "application/problem+json";

        var json = JsonSerializer.Serialize(problem, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        await context.Response.WriteAsync(json);
    }
}
