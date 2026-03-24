using MediatR;
using Microsoft.EntityFrameworkCore;
using AgroPlatform.Application.Common.Interfaces;

namespace AgroPlatform.Application.Users.Queries.GetApiKeys;

public class GetApiKeysHandler : IRequestHandler<GetApiKeysQuery, List<ApiKeyDto>>
{
    private readonly IAppDbContext _context;

    public GetApiKeysHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<List<ApiKeyDto>> Handle(GetApiKeysQuery request, CancellationToken cancellationToken)
    {
        var keys = await _context.ApiKeys
            .Where(k => k.TenantId == request.TenantId && !k.IsDeleted)
            .OrderByDescending(k => k.CreatedAtUtc)
            .Select(k => new ApiKeyDto(
                k.Id,
                k.Name,
                k.Scopes,
                k.ExpiresAtUtc,
                k.LastUsedAtUtc,
                k.IsRevoked,
                k.RateLimitPerHour,
                k.CreatedAtUtc
            ))
            .ToListAsync(cancellationToken);

        return keys;
    }
}
