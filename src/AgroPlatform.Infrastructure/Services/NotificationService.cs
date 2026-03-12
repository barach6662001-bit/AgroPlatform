using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Notifications;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Infrastructure.Services;

public class NotificationService : INotificationService
{
    private readonly IServiceProvider _serviceProvider;

    public NotificationService(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
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
    }
}
