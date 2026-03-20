namespace AgroPlatform.Application.Common.Interfaces;

public interface IFcmService
{
    /// <summary>Sends a push notification to the supplied FCM registration tokens.</summary>
    Task SendAsync(IEnumerable<string> tokens, string title, string body, CancellationToken cancellationToken = default);
}
