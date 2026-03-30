using FluentValidation;

namespace AgroPlatform.Application.Users.Commands.CreateApiKey;

public class CreateApiKeyValidator : AbstractValidator<CreateApiKeyCommand>
{
    public CreateApiKeyValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Scopes).NotEmpty().MaximumLength(500);
        RuleFor(x => x.RateLimitPerHour).GreaterThan(0).When(x => x.RateLimitPerHour.HasValue);
        RuleFor(x => x.WebhookUrl).MaximumLength(500).When(x => x.WebhookUrl != null);
    }
}
