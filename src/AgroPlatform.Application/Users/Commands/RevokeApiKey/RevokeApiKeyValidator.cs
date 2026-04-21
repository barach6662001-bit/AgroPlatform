using FluentValidation;

namespace AgroPlatform.Application.Users.Commands.RevokeApiKey;

public class RevokeApiKeyValidator : AbstractValidator<RevokeApiKeyCommand>
{
    public RevokeApiKeyValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty();
        RuleFor(x => x.ApiKeyId).NotEmpty();
    }
}
