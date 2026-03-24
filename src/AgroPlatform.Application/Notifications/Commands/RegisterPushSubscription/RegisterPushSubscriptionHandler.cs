using AgroPlatform.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Notifications.Commands.RegisterPushSubscription;

public class RegisterPushSubscriptionHandler : IRequestHandler<RegisterPushSubscriptionCommand, Guid>
{
    private readonly IAppDbContext _context;
    private readonly ITenantService _tenantService;

    public RegisterPushSubscriptionHandler(IAppDbContext context, ITenantService tenantService)
    {
        _context = context;
        _tenantService = tenantService;
    }

    public async Task<Guid> Handle(RegisterPushSubscriptionCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetTenantId();

        var existing = await _context.PushSubscriptions
            .FirstOrDefaultAsync(p => p.Endpoint == request.Endpoint, cancellationToken);

        if (existing is not null)
        {
            existing.P256dhKey = request.P256dhKey;
            existing.AuthKey = request.AuthKey;
            existing.UserAgent = request.UserAgent;
            await _context.SaveChangesAsync(cancellationToken);
            return existing.Id;
        }

        var subscription = new Domain.Notifications.PushSubscription
        {
            TenantId = tenantId,
            Endpoint = request.Endpoint,
            P256dhKey = request.P256dhKey,
            AuthKey = request.AuthKey,
            UserAgent = request.UserAgent,
            CreatedAtUtc = DateTime.UtcNow,
        };

        _context.PushSubscriptions.Add(subscription);
        await _context.SaveChangesAsync(cancellationToken);

        return subscription.Id;
    }
}
