namespace AgroPlatform.Domain.Users;

/// <summary>
/// TOTP / backup-code MFA settings for a single <see cref="AppUser"/>.
/// Not tenant-scoped — 2FA is a per-user security control.
/// </summary>
public class UserMfaSettings
{
    /// <summary>AspNetUsers.Id of the owning user (primary key, FK).</summary>
    public string UserId { get; set; } = string.Empty;

    /// <summary>Base32-encoded TOTP shared secret (max 32 chars).</summary>
    public string SecretKey { get; set; } = string.Empty;

    /// <summary>True once the user has verified a code and completed MFA setup.</summary>
    public bool IsEnabled { get; set; }

    /// <summary>JSON array of BCrypt-hashed backup codes. Consumed codes are removed from this list.</summary>
    public string BackupCodes { get; set; } = "[]";

    /// <summary>UTC timestamp when MFA was enabled. Null until <see cref="IsEnabled"/> becomes true.</summary>
    public DateTime? EnabledAt { get; set; }
}
