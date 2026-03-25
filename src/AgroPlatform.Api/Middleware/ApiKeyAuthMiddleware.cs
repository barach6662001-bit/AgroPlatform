using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using AgroPlatform.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace AgroPlatform.Api.Middleware;

/// <summary>
/// Authenticates requests that provide an API key via X-Api-Key or Authorization: ApiKey &lt;key&gt;.
/// If valid, sets HttpContext.User and ensures TenantId is present in HttpContext.Items.
/// </summary>
public class ApiKeyAuthMiddleware
{
    private readonly RequestDelegate _next;

    public ApiKeyAuthMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, IServiceScopeFactory scopeFactory)
    {
        // If JWT auth already succeeded, skip API key flow.
        if (context.User?.Identity?.IsAuthenticated == true)
        {
            await _next(context);
            return;
        }

        var apiKeyRaw = ReadApiKey(context.Request);
        if (string.IsNullOrWhiteSpace(apiKeyRaw))
        {
            await _next(context);
            return;
        }

        var keyHash = HashKey(apiKeyRaw);

        // Create a dedicated scope for API key lookup so we don't initialize the request-scoped
        // tenant-filtered DbContext before TenantId is resolved from the API key.
        using var scope = scopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        // Ignore tenant query filters here because tenant can be unknown before API key auth.
        var apiKey = await dbContext.ApiKeys
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(k => k.KeyHash == keyHash && !k.IsRevoked && !k.IsDeleted);

        if (apiKey is null)
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            await context.Response.WriteAsJsonAsync(new { error = "Invalid API key" });
            return;
        }

        if (apiKey.ExpiresAtUtc.HasValue && apiKey.ExpiresAtUtc.Value <= DateTime.UtcNow)
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            await context.Response.WriteAsJsonAsync(new { error = "API key is expired" });
            return;
        }

        // If tenant header exists, it must match the API key tenant.
        if (context.Items.TryGetValue("TenantId", out var tenantObj)
            && tenantObj is Guid tenantIdFromHeader
            && tenantIdFromHeader != Guid.Empty
            && tenantIdFromHeader != apiKey.TenantId)
        {
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            await context.Response.WriteAsJsonAsync(new { error = "Tenant mismatch for API key" });
            return;
        }

        context.Items["TenantId"] = apiKey.TenantId;

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, apiKey.Id.ToString()),
            new(ClaimTypes.Name, apiKey.Name),
            new("tenant_id", apiKey.TenantId.ToString()),
            new("auth_type", "ApiKey")
        };

        foreach (var apiScope in SplitScopes(apiKey.Scopes))
        {
            claims.Add(new Claim("scope", apiScope));
        }

        var identity = new ClaimsIdentity(claims, authenticationType: "ApiKey");
        context.User = new ClaimsPrincipal(identity);

        apiKey.LastUsedAtUtc = DateTime.UtcNow;
        await dbContext.SaveChangesAsync();

        await _next(context);
    }

    private static string? ReadApiKey(HttpRequest request)
    {
        if (request.Headers.TryGetValue("X-Api-Key", out var xApiKey) && !string.IsNullOrWhiteSpace(xApiKey))
            return xApiKey.ToString();

        if (request.Headers.TryGetValue("Authorization", out var authorization))
        {
            var value = authorization.ToString();
            const string prefix = "ApiKey ";
            if (value.StartsWith(prefix, StringComparison.OrdinalIgnoreCase) && value.Length > prefix.Length)
                return value[prefix.Length..].Trim();
        }

        return null;
    }

    private static IEnumerable<string> SplitScopes(string scopes)
    {
        return scopes
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Where(s => !string.IsNullOrWhiteSpace(s));
    }

    private static string HashKey(string key)
    {
        using var sha256 = SHA256.Create();
        var hash = sha256.ComputeHash(Encoding.UTF8.GetBytes(key));
        return Convert.ToBase64String(hash);
    }
}
