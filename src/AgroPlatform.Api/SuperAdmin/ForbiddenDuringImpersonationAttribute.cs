using AgroPlatform.Application.Common.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.DependencyInjection;

namespace AgroPlatform.Api.SuperAdmin;

/// <summary>
/// Marks a controller action as forbidden during a super-admin impersonation
/// session. When applied, requests carrying an <c>impersonated_by_user_id</c>
/// claim are rejected with HTTP 403, AND a separate audit entry of action
/// <c>impersonate.forbidden_attempt</c> is written via
/// <see cref="IImpersonationService.LogForbiddenAttemptAsync"/>.
/// (PR #614, locked decision: forbidden actions during impersonation.)
/// </summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = false, Inherited = true)]
public sealed class ForbiddenDuringImpersonationAttribute : TypeFilterAttribute
{
    public ForbiddenDuringImpersonationAttribute() : base(typeof(ForbiddenDuringImpersonationFilter))
    {
    }
}

internal sealed class ForbiddenDuringImpersonationFilter : IAsyncAuthorizationFilter
{
    private readonly ICurrentUserService _currentUser;
    private readonly IImpersonationService _impersonation;

    public ForbiddenDuringImpersonationFilter(ICurrentUserService currentUser, IImpersonationService impersonation)
    {
        _currentUser = currentUser;
        _impersonation = impersonation;
    }

    public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
    {
        if (!_currentUser.IsImpersonating) return;

        var route = context.HttpContext.Request.Path.HasValue
            ? context.HttpContext.Request.Path.Value!
            : "(unknown)";

        await _impersonation.LogForbiddenAttemptAsync(route, context.HttpContext.RequestAborted);

        context.Result = new ObjectResult(new
        {
            error = "forbidden_during_impersonation",
            message = "Цю дію не можна виконати під час сесії імперсонації.",
            attemptedRoute = route,
        })
        {
            StatusCode = StatusCodes.Status403Forbidden,
        };
    }
}
