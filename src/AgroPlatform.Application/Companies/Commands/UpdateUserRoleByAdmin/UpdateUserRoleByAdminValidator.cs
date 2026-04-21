using AgroPlatform.Domain.Enums;
using FluentValidation;

namespace AgroPlatform.Application.Companies.Commands.UpdateUserRoleByAdmin;

public class UpdateUserRoleByAdminValidator : AbstractValidator<UpdateUserRoleByAdminCommand>
{
    public UpdateUserRoleByAdminValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("UserId is required.");

        RuleFor(x => x.Role)
            .NotEmpty().WithMessage("Role is required.")
            .Must(r => Enum.TryParse<UserRole>(r, out var parsed) && parsed != UserRole.SuperAdmin)
            .WithMessage("Invalid role. SuperAdmin cannot be assigned.");
    }
}
