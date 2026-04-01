using FluentValidation;

namespace AgroPlatform.Application.Notifications.Commands.RegisterMobilePushToken;

public class RegisterMobilePushTokenValidator : AbstractValidator<RegisterMobilePushTokenCommand>
{
    public RegisterMobilePushTokenValidator()
    {
        RuleFor(x => x.Token).NotEmpty().MaximumLength(512);
        RuleFor(x => x.Platform).NotEmpty().Must(p => p is "ios" or "android")
            .WithMessage("Platform must be 'ios' or 'android'.");
    }
}
