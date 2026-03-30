using FluentValidation;

namespace AgroPlatform.Application.Tenants.Commands.UpdateTenant;

public class UpdateTenantValidator : AbstractValidator<UpdateTenantCommand>
{
    public UpdateTenantValidator()
    {
        RuleFor(x => x.CompanyName).MaximumLength(200).When(x => x.CompanyName != null);
        RuleFor(x => x.Edrpou).MaximumLength(20).When(x => x.Edrpou != null);
        RuleFor(x => x.Address).MaximumLength(500).When(x => x.Address != null);
        RuleFor(x => x.Phone).MaximumLength(50).When(x => x.Phone != null);
    }
}
