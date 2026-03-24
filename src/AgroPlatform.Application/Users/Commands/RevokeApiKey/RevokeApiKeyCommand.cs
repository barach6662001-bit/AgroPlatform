using MediatR;

namespace AgroPlatform.Application.Users.Commands.RevokeApiKey;

/// <summary>Command to revoke an API key.</summary>
public record RevokeApiKeyCommand(Guid TenantId, Guid ApiKeyId) : IRequest<Unit>;
