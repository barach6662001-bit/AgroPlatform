using MediatR;
using Microsoft.EntityFrameworkCore;
using AgroPlatform.Application.Common.Interfaces;

namespace AgroPlatform.Application.Users.Commands.RevokeApiKey;

public class RevokeApiKeyHandler : IRequestHandler<RevokeApiKeyCommand, Unit>
{
    private readonly IAppDbContext _context;

    public RevokeApiKeyHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<Unit> Handle(RevokeApiKeyCommand request, CancellationToken cancellationToken)
    {
        var apiKey = await _context.ApiKeys
            .FirstOrDefaultAsync(k => k.Id == request.ApiKeyId && k.TenantId == request.TenantId, cancellationToken)
            ?? throw new InvalidOperationException($"API key {request.ApiKeyId} not found.");

        apiKey.IsRevoked = true;
        apiKey.UpdatedAtUtc = DateTime.UtcNow;

        _context.ApiKeys.Update(apiKey);
        await _context.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
