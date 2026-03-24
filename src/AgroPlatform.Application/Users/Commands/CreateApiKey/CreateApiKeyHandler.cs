using MediatR;
using System.Security.Cryptography;
using System.Text;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Users;

namespace AgroPlatform.Application.Users.Commands.CreateApiKey;

public class CreateApiKeyHandler : IRequestHandler<CreateApiKeyCommand, CreateApiKeyResult>
{
    private readonly IAppDbContext _context;

    public CreateApiKeyHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<CreateApiKeyResult> Handle(CreateApiKeyCommand request, CancellationToken cancellationToken)
    {
        // Generate a random key (32 bytes = 256 bits, encoded as base64)
        var keyBytes = new byte[32];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(keyBytes);
        var key = Convert.ToBase64String(keyBytes);

        // Hash the key for storage
        var keyHash = HashKey(key);

        var apiKey = new ApiKey
        {
            Id = Guid.NewGuid(),
            TenantId = request.TenantId,
            Name = request.Name,
            Scopes = request.Scopes,
            ExpiresAtUtc = request.ExpiresAtUtc,
            RateLimitPerHour = request.RateLimitPerHour,
            WebhookUrl = request.WebhookUrl,
            WebhookEventTypes = request.WebhookEventTypes,
            KeyHash = keyHash,
            IsRevoked = false,
            CreatedAtUtc = DateTime.UtcNow,
            UpdatedAtUtc = DateTime.UtcNow
        };

        _context.ApiKeys.Add(apiKey);
        await _context.SaveChangesAsync(cancellationToken);

        return new CreateApiKeyResult(
            apiKey.Id,
            key,
            apiKey.Name,
            apiKey.Scopes,
            apiKey.CreatedAtUtc
        );
    }

    private static string HashKey(string key)
    {
        using var sha256 = SHA256.Create();
        var hash = sha256.ComputeHash(Encoding.UTF8.GetBytes(key));
        return Convert.ToBase64String(hash);
    }
}
