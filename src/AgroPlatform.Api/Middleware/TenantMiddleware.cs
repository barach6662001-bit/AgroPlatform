using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

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
        // Skip tenant requirement for auth and health endpoints
        if (context.Request.Path.StartsWithSegments("/api/auth", StringComparison.OrdinalIgnoreCase)
            || context.Request.Path.StartsWithSegments("/health", StringComparison.OrdinalIgnoreCase))
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
            await WriteProblemAsync(context, StatusCodes.Status400BadRequest,
                "https://tools.ietf.org/html/rfc7231#section-6.5.1",
                "Missing Tenant Header",
                "X-Tenant-Id header is required.");
            return;
        }

        if (!Guid.TryParse(tenantIdValue, out var tenantId))
        {
            await WriteProblemAsync(context, StatusCodes.Status400BadRequest,
                "https://tools.ietf.org/html/rfc7231#section-6.5.1",
                "Invalid Tenant Header",
                "X-Tenant-Id header must be a valid GUID.");
            return;
        }

        context.Items["TenantId"] = tenantId;
        await _next(context);
    }

    private static async Task WriteProblemAsync(HttpContext context, int statusCode, string type, string title, string detail)
    {
        var problem = new ProblemDetails
        {
            Type = type,
            Title = title,
            Status = statusCode,
            Detail = detail,
            Instance = context.Request.Path
        };

        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/problem+json";

        var json = JsonSerializer.Serialize(problem, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        await context.Response.WriteAsync(json);
    }
}
