using AgroPlatform.Application.Common.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Api.SuperAdmin;

/// <summary>
/// Marks a controller/action as requiring an MFA-verified super-admin. Returns 403 otherwise;
/// for super-admins without MFA, sets <c>X-Mfa-Required: true</c> so the SPA can redirect
/// the user to <c>/setup-mfa</c>.
/// </summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = false, Inherited = true)]
public sealed class SuperAdminRequiredAttribute : TypeFilterAttribute
{
    public SuperAdminRequiredAttribute() : base(typeof(SuperAdminRequiredFilter))
    {
    }
}

public sealed class SuperAdminRequiredFilter : IAsyncAuthorizationFilter
{
    private readonly ICurrentUserService _currentUser;
    private readonly IAppDbContext _db;

    public SuperAdminRequiredFilter(ICurrentUserService currentUser, IAppDbContext db)
    {
        _currentUser = currentUser;
        _db = db;
    }

    public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
    {
        if (!_currentUser.MfaVerified || string.IsNullOrEmpty(_currentUser.UserId))
        {
            context.Result = new StatusCodeResult(StatusCodes.Status403Forbidden);
            return;
        }

        if (!_currentUser.IsSuperAdmin)
        {
            context.Result = new StatusCodeResult(StatusCodes.Status403Forbidden);
            return;
        }

        // MFA is mandatory for super-admins. Signal the SPA so it can redirect to /setup-mfa.
        var mfa = await _db.UserMfaSettings
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.UserId == _currentUser.UserId);

        if (mfa is null || !mfa.IsEnabled)
        {
            context.HttpContext.Response.Headers["X-Mfa-Required"] = "true";
            context.Result = new StatusCodeResult(StatusCodes.Status403Forbidden);
        }
    }
}
