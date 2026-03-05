namespace AgroPlatform.Api.Middleware;

public class TenantMiddleware
{
    private readonly RequestDelegate _next;

    public TenantMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Skip tenant requirement for auth endpoints
        if (context.Request.Path.StartsWithSegments("/api/auth", StringComparison.OrdinalIgnoreCase))
        {
            if (context.Request.Headers.TryGetValue("X-Tenant-Id", out var authTenantIdValue)
                && Guid.TryParse(authTenantIdValue, out var authTenantId))
            {
                context.Items["TenantId"] = authTenantId;
            }
            await _next(context);
            return;
        }

        if (!context.Request.Headers.TryGetValue("X-Tenant-Id", out var tenantIdValue))
        {
            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsync("{\"detail\":\"X-Tenant-Id header is required.\"}");
            return;
        }

        if (!Guid.TryParse(tenantIdValue, out var tenantId))
        {
            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsync("{\"detail\":\"X-Tenant-Id header must be a valid GUID.\"}");
            return;
        }

        context.Items["TenantId"] = tenantId;
        await _next(context);
    }
}
