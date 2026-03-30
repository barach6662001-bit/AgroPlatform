using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;

namespace AgroPlatform.Api.Middleware;

/// <summary>
/// Ensures that authenticated non-admin users cannot access data belonging to a different
/// tenant by spoofing the <c>X-Tenant-Id</c> header.
///
/// After JWT / API-key authentication has been resolved, this middleware compares the
/// <c>TenantId</c> claim embedded in the token with the tenant resolved by
/// <see cref="TenantMiddleware"/> (stored in <c>HttpContext.Items["TenantId"]</c>).
/// If they differ and the caller is not an administrator, the request is rejected with
/// <c>403 Forbidden</c>.
///
/// API-key-authenticated requests are skipped because <see cref="ApiKeyAuthMiddleware"/>
/// already enforces tenant matching for API keys.
/// </summary>
public class TenantAuthorizationMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<TenantAuthorizationMiddleware> _logger;

    public TenantAuthorizationMiddleware(RequestDelegate next, ILogger<TenantAuthorizationMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var user = context.User;

        if (user?.Identity?.IsAuthenticated == true)
        {
            // API-key users are already validated by ApiKeyAuthMiddleware.
            var authType = user.FindFirstValue("auth_type");
            if (!string.Equals(authType, "ApiKey", StringComparison.OrdinalIgnoreCase))
            {
                var roleClaim = user.FindFirstValue(ClaimTypes.Role);
                var isAdmin = roleClaim is "Administrator" or "Admin";

                if (isAdmin)
                {
                    // Admins bypass tenant cross-check but should still have a tenant context
                    // for write operations to prevent accidentally operating without tenant scope.
                    if (!context.Items.ContainsKey("TenantId") || context.Items["TenantId"] is not Guid)
                    {
                        _logger.LogWarning(
                            "Admin request to {Path} is proceeding without a resolved TenantId in context. " +
                            "Ensure X-Tenant-Id header is provided for tenant-scoped operations.",
                            context.Request.Path);
                    }
                }
                else
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
