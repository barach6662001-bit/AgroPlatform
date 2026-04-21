using System.Security.Claims;
using AgroPlatform.Application.Common.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace AgroPlatform.Api.Authorization;

/// <summary>
/// Evaluates <see cref="PermissionRequirement"/> using a three-stage lookup:
///
/// 1. <b>Admin override</b> — roles that normalize to "Admin" (including legacy "Administrator")
///    are immediately granted every permission.
/// 2. <b>DB lookup</b> — queries the <c>RolePermissions</c> table for the normalized role.
///    Results are cached per role for 5 minutes (IMemoryCache).
/// 3. <b>Hardcoded fallback</b> — if the DB has no rows for the role (e.g., fresh DB before
///    seeding), falls back to the compile-time matrix in
///    <see cref="HardcodedPermissionFallback"/>.
///
/// API-key–authenticated users (no Role claim) are not granted any permission.
/// </summary>
public class PermissionAuthorizationHandler : AuthorizationHandler<PermissionRequirement>
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly IMemoryCache _cache;

    public PermissionAuthorizationHandler(IServiceScopeFactory scopeFactory, IMemoryCache cache)
    {
        _scopeFactory = scopeFactory;
        _cache        = cache;
    }

    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context, PermissionRequirement requirement)
    {
        var roleClaim = context.User.FindFirstValue(ClaimTypes.Role);
        if (string.IsNullOrEmpty(roleClaim))
            return; // API key or unauthenticated — do not succeed

        // Normalize legacy role aliases to canonical UserRole enum names
        var normalizedRole = NormalizeRole(roleClaim);

        // Stage 1 — Admin overrides: SuperAdmin and CompanyAdmin have all permissions
        if (normalizedRole is "SuperAdmin" or "CompanyAdmin")
        {
            context.Succeed(requirement);
            return;
        }

        // Stage 2 — Cache lookup (per normalized role; set populated below on first miss)
        var cacheKey = $"rbac:{normalizedRole}";
        if (!_cache.TryGetValue(cacheKey, out HashSet<string>? grantedSet))
        {
            grantedSet = await LoadFromDbOrFallbackAsync(normalizedRole);
            _cache.Set(cacheKey, grantedSet,
                new MemoryCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5)
                });
        }

        // Stage 3 — Evaluate requirement
        if (grantedSet!.Contains(requirement.PolicyName))
            context.Succeed(requirement);
    }

    private async Task<HashSet<string>> LoadFromDbOrFallbackAsync(string roleName)
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<IAppDbContext>();

        var rows = await db.RolePermissions
            .AsNoTracking()
            .Where(r => r.RoleName == roleName)
            .ToListAsync();

        // If no rows found for role → DB not seeded yet; use hardcoded fallback
        if (rows.Count == 0)
            return HardcodedPermissionFallback.GetGrantedPolicies(roleName);

        return rows.Where(r => r.IsGranted)
                   .Select(r => r.PolicyName)
                   .ToHashSet(StringComparer.Ordinal);
    }

    /// <summary>Maps legacy role aliases to their canonical UserRole enum names.</summary>
    private static string NormalizeRole(string role) =>
        role switch
        {
            "Administrator" or "Admin" => "CompanyAdmin",
            "Storekeeper" or "Operator" => "WarehouseOperator",
            "Director" => "Accountant",
            _ => role,
        };
}
