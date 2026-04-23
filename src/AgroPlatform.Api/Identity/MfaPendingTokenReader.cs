using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace AgroPlatform.Api.Identity;

/// <summary>
/// Lightweight helper that decodes an <c>mfa_pending</c> JWT **without** signature validation.
/// Signature-validated authentication still happens via the normal JWT middleware when the SPA
/// calls <c>/api/auth/mfa/verify</c> with <c>[AllowAnonymous]</c>; we only need the subject
/// claim here to look up the user and their stored secret.
/// </summary>
internal static class MfaPendingTokenReader
{
    public static string? TryExtractUserId(string? token)
    {
        if (string.IsNullOrWhiteSpace(token)) return null;

        try
        {
            var handler = new JwtSecurityTokenHandler();
            if (!handler.CanReadToken(token)) return null;

            var jwt = handler.ReadJwtToken(token);
            // Refuse anything that isn't mfa_pending scope.
            var scope = jwt.Claims.FirstOrDefault(c => c.Type == "scope")?.Value;
            if (!string.Equals(scope, "mfa_pending", StringComparison.OrdinalIgnoreCase)) return null;

            // Reject expired tokens.
            if (jwt.ValidTo != DateTime.MinValue && jwt.ValidTo < DateTime.UtcNow) return null;

            return jwt.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Sub)?.Value
                ?? jwt.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
        }
        catch
        {
            return null;
        }
    }
}
