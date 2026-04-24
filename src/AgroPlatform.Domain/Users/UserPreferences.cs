namespace AgroPlatform.Domain.Users;

/// <summary>
/// Per-user presentation preferences. One row per <see cref="AppUser"/>.
/// Deliberately scoped to display concerns — stored values in DB remain in UAH.
/// </summary>
public class UserPreferences
{
    /// <summary>FK to AspNetUsers.Id (string — Identity default).</summary>
    public string UserId { get; set; } = string.Empty;

    /// <summary>ISO 4217 display currency. Allowed: UAH, USD, EUR. Default UAH.</summary>
    public string PreferredCurrency { get; set; } = "UAH";

    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
}
