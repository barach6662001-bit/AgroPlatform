using AgroPlatform.Application.Common.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace AgroPlatform.Api.FeatureFlags;

public sealed class RequireFeatureFlagFilter : IAsyncActionFilter
{
    private readonly string _key;
    private readonly IFeatureFlagService _featureFlags;

    public RequireFeatureFlagFilter(string key, IFeatureFlagService featureFlags)
    {
        _key = key;
        _featureFlags = featureFlags;
    }

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var enabled = await _featureFlags.IsEnabledAsync(_key, context.HttpContext.RequestAborted);
        if (!enabled)
        {
            context.Result = new NotFoundResult();
            return;
        }

        await next();
    }
}