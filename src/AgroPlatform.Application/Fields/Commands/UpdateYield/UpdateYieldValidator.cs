using FluentValidation;

namespace AgroPlatform.Application.Fields.Commands.UpdateYield;

public class UpdateYieldValidator : AbstractValidator<UpdateYieldCommand>
{
    public UpdateYieldValidator()
    {
        RuleFor(x => x.CropHistoryId).NotEmpty();
        RuleFor(x => x.YieldPerHectare).GreaterThanOrEqualTo(0);
    }
}
