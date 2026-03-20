using AgroPlatform.Application.Common.Interfaces;
using FirebaseAdmin;
using FirebaseAdmin.Messaging;
using Google.Apis.Auth.OAuth2;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace AgroPlatform.Infrastructure.Services;

public class FcmService : IFcmService
{
    private readonly ILogger<FcmService> _logger;
    private readonly FirebaseApp? _app;

    public FcmService(IOptions<FcmSettings> options, ILogger<FcmService> logger)
    {
        _logger = logger;

        var credentialsJson = options.Value.CredentialsJson;
        if (string.IsNullOrWhiteSpace(credentialsJson))
        {
            _logger.LogWarning("FCM is not configured (Fcm:CredentialsJson is empty). Push notifications will be skipped.");
            return;
        }

        // Firebase SDK is a singleton — guard against double-initialisation (e.g. in tests).
        _app = FirebaseApp.GetInstance("[DEFAULT]") is not null
            ? FirebaseApp.GetInstance("[DEFAULT]")
            : FirebaseApp.Create(new AppOptions
            {
                Credential = GoogleCredential.FromJson(credentialsJson),
            });
    }

    public async Task SendAsync(IEnumerable<string> tokens, string title, string body, CancellationToken cancellationToken = default)
    {
        if (_app is null) return;

        var tokenList = tokens.Where(t => !string.IsNullOrWhiteSpace(t)).ToList();
        if (tokenList.Count == 0) return;

        var message = new MulticastMessage
        {
            Tokens = tokenList,
            Notification = new Notification
            {
                Title = title,
                Body = body,
            },
        };

        try
        {
            var response = await FirebaseMessaging.GetMessaging(_app).SendEachForMulticastAsync(message, cancellationToken);
            if (response.FailureCount > 0)
                _logger.LogWarning("FCM: {FailureCount}/{Total} messages failed to send.", response.FailureCount, tokenList.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "FCM: Failed to send push notification.");
        }
    }
}
