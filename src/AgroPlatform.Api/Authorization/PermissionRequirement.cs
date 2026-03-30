using Microsoft.AspNetCore.Authorization;

namespace AgroPlatform.Api.Authorization;

/// <summary>
/// Authorization requirement that is satisfied by a DB-driven (or fallback hardcoded)
/// role-permission lookup. Used with <see cref="PermissionAuthorizationHandler"/>.
/// </summary>
public record PermissionRequirement(string PolicyName) : IAuthorizationRequirement;
