using System.Security.Cryptography;
using System.Text;
using AgroPlatform.Application.Common.Interfaces;
using OtpNet;

namespace AgroPlatform.Infrastructure.Services;

/// <summary>
/// TOTP + backup-code primitives. The service is stateless — persistence of the
/// <see cref="AgroPlatform.Domain.Users.UserMfaSettings"/> row is the caller's job.
/// </summary>
public sealed class MfaService : IMfaService
{
    private const string BackupCodeAlphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars
    private const int BackupCodeLength = 8;

    public string GenerateSecret()
    {
        // 160-bit secret → ~32 chars in base32 (RFC 4648, no padding).
        var bytes = KeyGeneration.GenerateRandomKey(20);
        return Base32Encoding.ToString(bytes).TrimEnd('=');
    }

    public string GetOtpAuthUri(string secret, string accountEmail, string issuer = "AgroPlatform")
    {
        var label = Uri.EscapeDataString($"{issuer}:{accountEmail}");
        var enc = Uri.EscapeDataString(issuer);
        return $"otpauth://totp/{label}?secret={secret}&issuer={enc}&algorithm=SHA1&digits=6&period=30";
    }

    public bool VerifyTotp(string secret, string code)
    {
        if (string.IsNullOrWhiteSpace(secret) || string.IsNullOrWhiteSpace(code))
            return false;

        // Strip whitespace users tend to type in.
        code = code.Trim().Replace(" ", string.Empty);
        if (code.Length != 6 || !code.All(char.IsDigit)) return false;

        try
        {
            var bytes = Base32Encoding.ToBytes(secret);
            var totp = new Totp(bytes);
            return totp.VerifyTotp(code, out _, new VerificationWindow(previous: 1, future: 1));
        }
        catch
        {
            return false;
        }
    }

    public (IReadOnlyList<string> Plaintext, IReadOnlyList<string> Hashes) GenerateBackupCodes(int count = 10)
    {
        var plaintext = new List<string>(count);
        var hashes = new List<string>(count);

        for (var i = 0; i < count; i++)
        {
            var code = GenerateBackupCode();
            plaintext.Add(code);
            hashes.Add(BCrypt.Net.BCrypt.HashPassword(code));
        }

        return (plaintext, hashes);
    }

    public bool TryConsumeBackupCode(List<string> hashedCodes, string input)
    {
        if (string.IsNullOrWhiteSpace(input)) return false;
        var normalized = input.Trim().ToUpperInvariant().Replace("-", string.Empty).Replace(" ", string.Empty);

        for (var i = 0; i < hashedCodes.Count; i++)
        {
            if (BCrypt.Net.BCrypt.Verify(normalized, hashedCodes[i]))
            {
                hashedCodes.RemoveAt(i);
                return true;
            }
        }

        return false;
    }

    private static string GenerateBackupCode()
    {
        Span<byte> buf = stackalloc byte[BackupCodeLength];
        RandomNumberGenerator.Fill(buf);

        var sb = new StringBuilder(BackupCodeLength);
        for (var i = 0; i < BackupCodeLength; i++)
        {
            sb.Append(BackupCodeAlphabet[buf[i] % BackupCodeAlphabet.Length]);
        }
        return sb.ToString();
    }
}
