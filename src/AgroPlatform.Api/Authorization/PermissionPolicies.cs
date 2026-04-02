using AgroPlatform.Domain.Authorization;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.DependencyInjection;

namespace AgroPlatform.Api.Authorization;

public static class PermissionPolicies
{
    public static IServiceCollection AddPermissionPolicies(this IServiceCollection services)
    {
        services.AddScoped<IAuthorizationHandler, PermissionAuthorizationHandler>();

        services.AddAuthorization(options =>
        {
            AddPermission(options, Permissions.Warehouses.View);
            AddPermission(options, Permissions.Inventory.View);
            AddPermission(options, Permissions.Analytics.View);
            AddPermission(options, Permissions.Machinery.View);
            AddPermission(options, Permissions.Fields.View);
            AddPermission(options, Permissions.Economics.View);
            AddPermission(options, Permissions.HR.View);
            AddPermission(options, Permissions.GrainStorage.View);
            AddPermission(options, Permissions.Fuel.View);
            AddPermission(options, Permissions.Sales.View);

            AddPermission(options, Permissions.Warehouses.Manage);
            AddPermission(options, Permissions.Inventory.Manage);
            AddPermission(options, Permissions.Machinery.Manage);
            AddPermission(options, Permissions.Fields.Manage);
            AddPermission(options, Permissions.Economics.Manage);
            AddPermission(options, Permissions.HR.Manage);
            AddPermission(options, Permissions.GrainStorage.Manage);
            AddPermission(options, Permissions.Fuel.Manage);
            AddPermission(options, Permissions.Sales.Manage);
            AddPermission(options, Permissions.Admin.Manage);

            options.AddPolicy(Permissions.Platform.SuperAdmin,
                policy => policy.RequireRole("SuperAdmin"));
        });

        return services;
    }

    private static void AddPermission(AuthorizationOptions options, string policyName)
    {
        options.AddPolicy(policyName, policy =>
            policy.Requirements.Add(new PermissionRequirement(policyName)));
    }
}
