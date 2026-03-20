using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Notifications;
using AgroPlatform.Domain.Users;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace AgroPlatform.Infrastructure.Services;

public class NotificationService : INotificationService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly IFcmService _fcmService;

    public NotificationService(IServiceProvider serviceProvider, IFcmService fcmService)
    {
        _serviceProvider = serviceProvider;
        _fcmService = fcmService;
    }

    public async Task SendAsync(Guid tenantId, string type, string title, string body, CancellationToken cancellationToken = default)
    {
        using var scope = _serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AgroPlatform.Infrastructure.Persistence.AppDbContext>();

        var notification = new Notification
        {
            TenantId = tenantId,
            Type = type,
            Title = title,
            Body = body,
            IsRead = false,
            CreatedAtUtc = DateTime.UtcNow,
        };

        context.Notifications.Add(notification);
        await context.SaveChangesAsync(cancellationToken);

        // Collect FCM tokens for all active users in this tenant and send push.
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<AppUser>>();
        var tokens = await userManager.Users
            .Where(u => u.TenantId == tenantId && u.IsActive && u.FcmToken != null)
            .Select(u => u.FcmToken!)
            .ToListAsync(cancellationToken);

        await _fcmService.SendAsync(tokens, title, body, cancellationToken);
    }
}

