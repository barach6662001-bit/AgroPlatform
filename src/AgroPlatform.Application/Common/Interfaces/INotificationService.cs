namespace AgroPlatform.Application.Common.Interfaces;

public interface INotificationService
{
    Task SendAsync(Guid tenantId, string type, string title, string body, CancellationToken cancellationToken = default);
}
