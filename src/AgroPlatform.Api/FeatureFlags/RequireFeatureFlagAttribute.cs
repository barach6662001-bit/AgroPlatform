using Microsoft.AspNetCore.Mvc;

namespace AgroPlatform.Api.FeatureFlags;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = true, Inherited = true)]
public sealed class RequireFeatureFlagAttribute : TypeFilterAttribute
{
    public RequireFeatureFlagAttribute(string key)
        : base(typeof(RequireFeatureFlagFilter))
    {
        Arguments = [key];
    }
}