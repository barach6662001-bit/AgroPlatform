namespace AgroPlatform.Infrastructure.Services;

public class FcmSettings
{
    /// <summary>
    /// The Firebase service-account JSON content (as a string).
    /// Set via the "Fcm:CredentialsJson" configuration key or the FCM_CREDENTIALS_JSON environment variable.
    /// </summary>
    public string CredentialsJson { get; set; } = string.Empty;
}
