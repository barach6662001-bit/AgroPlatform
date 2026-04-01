using System.Net.Http.Json;
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
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<NotificationService> _logger;

    public NotificationService(
        IServiceProvider serviceProvider,
        IEmailService emailService,
        IHttpClientFactory httpClientFactory,
        ILogger<NotificationService> logger)
    {
        _serviceProvider = serviceProvider;
        _emailService = emailService;
        _httpClientFactory = httpClientFactory;
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

        // Send Expo push notifications for error/warning
        if (type is "error" or "warning")
        {
            await SendExpoPushAsync(context, tenantId, title, body, cancellationToken);
        }
    }

    private async Task SendExpoPushAsync(
        Persistence.AppDbContext context,
        Guid tenantId,
        string title,
        string body,
        CancellationToken cancellationToken)
    {
        try
        {
            var tokens = await context.Set<MobilePushToken>()
                .IgnoreQueryFilters()
                .Where(t => t.TenantId == tenantId && t.IsActive && !t.IsDeleted)
                .Select(t => t.Token)
                .ToListAsync(cancellationToken);

            if (tokens.Count == 0) return;

            var client = _httpClientFactory.CreateClient();
            var messages = tokens.Select(token => new
            {
                to = token,
                title,
                body,
                sound = "default",
            }).ToList();

            var response = await client.PostAsJsonAsync(
                "https://exp.host/--/api/v2/push/send",
                messages,
                cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Expo push API returned {Status}", response.StatusCode);
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to send Expo push notifications");
        }
    }
}
