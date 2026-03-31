using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Notifications;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace AgroPlatform.Infrastructure.Services;

public class NotificationService : INotificationService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly IEmailService _emailService;
    private readonly ILogger<NotificationService> _logger;

    public NotificationService(IServiceProvider serviceProvider, IEmailService emailService, ILogger<NotificationService> logger)
    {
        _serviceProvider = serviceProvider;
        _emailService = emailService;
        _logger = logger;
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

        // Send email for high-priority notifications (errors and warnings)
        if (type is "error" or "warning")
        {
            try
            {
                var adminEmails = await context.Users
                    .Where(u => u.TenantId == tenantId)
                    .Join(context.UserRoles, u => u.Id, ur => ur.UserId, (u, ur) => new { u.Email, ur.RoleId })
                    .Join(context.Roles, x => x.RoleId, r => r.Id, (x, r) => new { x.Email, r.Name })
                    .Where(x => x.Name == "Admin" || x.Name == "Director")
                    .Select(x => x.Email)
                    .Distinct()
                    .ToListAsync(cancellationToken);

                foreach (var email in adminEmails.Where(e => !string.IsNullOrWhiteSpace(e)))
                {
                    await _emailService.SendAsync(email!, $"[AgroPlatform] {title}", $"<p>{body}</p>", cancellationToken);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to send email notification for {Title}", title);
            }
        }
    }
}
