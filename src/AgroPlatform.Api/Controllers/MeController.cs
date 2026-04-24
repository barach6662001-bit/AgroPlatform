using System.Security.Claims;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/me")]
[Produces("application/json")]
public sealed class MeController : ControllerBase
{
    private readonly IFeatureFlagService _featureFlags;
    private readonly IAppDbContext _db;
    private readonly UserManager<AppUser> _userManager;
    private readonly ICurrentUserService _currentUser;

    public MeController(
        IFeatureFlagService featureFlags,
        IAppDbContext db,
        UserManager<AppUser> userManager,
        ICurrentUserService currentUser)
    {
        _featureFlags = featureFlags;
        _db = db;
        _userManager = userManager;
        _currentUser = currentUser;
    }

    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> Get(CancellationToken cancellationToken)
    {
        var features = await _featureFlags.GetCurrentTenantFeaturesAsync(cancellationToken);

        var tenantIdClaim = User.FindFirstValue("TenantId");
        Guid.TryParse(tenantIdClaim, out var tenantId);

        var userId = _currentUser.UserId;
        bool isSuperAdmin = _currentUser.IsSuperAdmin;
        bool mfaEnabled = false;
        string preferredCurrency = "UAH";

        if (!string.IsNullOrEmpty(userId))
        {
            var mfa = await _db.UserMfaSettings.AsNoTracking().FirstOrDefaultAsync(x => x.UserId == userId, cancellationToken);
            mfaEnabled = mfa?.IsEnabled == true;

            // Prefer the DB flag over the JWT claim (claim may be stale across logins).
            var user = await _userManager.FindByIdAsync(userId);
            if (user is not null) isSuperAdmin = user.IsSuperAdmin || _currentUser.IsSuperAdmin;

            var prefs = await _db.UserPreferences.AsNoTracking().FirstOrDefaultAsync(p => p.UserId == userId, cancellationToken);
            if (prefs is not null) preferredCurrency = prefs.PreferredCurrency;
        }

        return Ok(new
        {
            email = User.FindFirstValue(ClaimTypes.Email) ?? string.Empty,
            role = User.FindFirstValue(ClaimTypes.Role) ?? string.Empty,
            tenantId,
            firstName = User.FindFirstValue("first_name") ?? string.Empty,
            lastName = User.FindFirstValue("last_name") ?? string.Empty,
            features,
            isSuperAdmin,
            mfaEnabled,
            preferredCurrency,
            // Super-admin without MFA enrolled → SPA redirects to /setup-mfa.
            mfaRequired = isSuperAdmin && !mfaEnabled,
        });
    }
}