using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Notifications;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Notifications.Commands.RegisterMobilePushToken;

public class RegisterMobilePushTokenHandler : IRequestHandler<RegisterMobilePushTokenCommand, Guid>
{
    private readonly IAppDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly ITenantService _tenantService;

    public RegisterMobilePushTokenHandler(
        IAppDbContext context,
        ICurrentUserService currentUser,
        ITenantService tenantService)
    {
        _context = context;
        _currentUser = currentUser;
        _tenantService = tenantService;
    }

    public async Task<Guid> Handle(RegisterMobilePushTokenCommand request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedAccessException();
        var tenantId = _tenantService.GetTenantId();

        var existing = await _context.MobilePushTokens
            .FirstOrDefaultAsync(t => t.UserId == userId && t.Token == request.Token, cancellationToken);

        if (existing is not null)
        {
            existing.Platform = request.Platform;
            existing.IsActive = true;
            existing.LastUsedAtUtc = DateTime.UtcNow;
            await _context.SaveChangesAsync(cancellationToken);
            return existing.Id;
        }

        var token = new MobilePushToken
        {
            TenantId = tenantId,
            UserId = userId,
            Token = request.Token,
            Platform = request.Platform,
            IsActive = true,
            LastUsedAtUtc = DateTime.UtcNow,
        };

        _context.MobilePushTokens.Add(token);
        await _context.SaveChangesAsync(cancellationToken);

        return token.Id;
    }
}
