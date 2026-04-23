namespace AgroPlatform.Application.Common.Interfaces;

public interface IMfaService
{
    /// <summary>Generates a new base32 TOTP secret (length 32).</summary>
    string GenerateSecret();

    /// <summary>Builds a standard <c>otpauth://totp/...</c> URI usable by any TOTP client.</summary>
    string GetOtpAuthUri(string secret, string accountEmail, string issuer = "AgroPlatform");

    /// <summary>Verifies a 6-digit TOTP code for the given secret, allowing ±1 step clock drift.</summary>
    bool VerifyTotp(string secret, string code);

    /// <summary>
    /// Produces 10 plaintext backup codes (8 chars, alphanumeric) alongside their BCrypt hashes.
    /// The caller is expected to return the plaintext to the user **exactly once** and persist the hashes.
    /// </summary>
    (IReadOnlyList<string> Plaintext, IReadOnlyList<string> Hashes) GenerateBackupCodes(int count = 10);

    /// <summary>
    /// If <paramref name="input"/> matches one of the hashed codes, returns true and removes that
    /// hash from the list (single-use). Otherwise returns false and leaves the list untouched.
    /// </summary>
    bool TryConsumeBackupCode(List<string> hashedCodes, string input);
}
