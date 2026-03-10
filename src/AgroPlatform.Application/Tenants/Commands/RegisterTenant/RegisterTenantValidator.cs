using FluentValidation;

namespace AgroPlatform.Application.Tenants.Commands.RegisterTenant;

public class RegisterTenantValidator : AbstractValidator<RegisterTenantCommand>
{
    public RegisterTenantValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(200);

        RuleFor(x => x.Inn)
            .MaximumLength(50)
            .When(x => x.Inn != null);
    }
}
