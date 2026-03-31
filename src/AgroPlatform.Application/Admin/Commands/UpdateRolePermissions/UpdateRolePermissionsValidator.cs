using FluentValidation;

namespace AgroPlatform.Application.Admin.Commands.UpdateRolePermissions;

public class UpdateRolePermissionsValidator : AbstractValidator<UpdateRolePermissionsCommand>
{
    private static readonly HashSet<string> AllowedRoles = new(StringComparer.Ordinal)
    {
        "SuperAdmin", "CompanyAdmin", "Manager", "WarehouseOperator", "Accountant", "Viewer",
        "Agronomist", "Storekeeper", "Director", "Operator"
    };

    private static readonly HashSet<string> AllowedPolicies = new(StringComparer.Ordinal)
    {
        "Warehouses.View", "Warehouses.Manage",
        "Inventory.View", "Inventory.Manage",
        "Analytics.View",
        "Machinery.View", "Machinery.Manage",
        "Fields.View", "Fields.Manage",
        "Economics.Manage",
        "HR.Manage",
        "GrainStorage.Manage",
        "Fuel.Manage",
        "Sales.Manage",
        "Admin.Manage",
        "Platform.SuperAdmin",
    };

    public UpdateRolePermissionsValidator()
    {
        RuleFor(x => x.Items).NotEmpty();
        RuleForEach(x => x.Items).ChildRules(item =>
        {
            item.RuleFor(i => i.RoleName).NotEmpty()
                .Must(r => AllowedRoles.Contains(r)).WithMessage("Invalid role name.");
            item.RuleFor(i => i.PolicyName).NotEmpty()
                .Must(p => AllowedPolicies.Contains(p)).WithMessage("Invalid policy name.");
        });
    }
}
