using FluentValidation;

namespace AgroPlatform.Application.Notifications.Commands.RegisterPushSubscription;

public class RegisterPushSubscriptionValidator : AbstractValidator<RegisterPushSubscriptionCommand>
{
    public RegisterPushSubscriptionValidator()
    {
        RuleFor(x => x.Endpoint).NotEmpty().MaximumLength(2000);
    }
}
