using FluentValidation;

namespace AgroPlatform.Application.Users.Commands.UpdateUserRole;

public class UpdateUserRoleValidator : AbstractValidator<UpdateUserRoleCommand>
{
    public UpdateUserRoleValidator()
    {
        RuleFor(x => x.UserId).NotEmpty().MaximumLength(450);
        RuleFor(x => x.Role).NotEmpty().MaximumLength(100);
    }
}
