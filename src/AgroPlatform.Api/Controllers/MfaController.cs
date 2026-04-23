using System.Text.Json;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Api.Controllers;

/// <summary>
/// TOTP / backup-code 2FA endpoints. Used primarily (and currently only mandatorily) by super-admins.
/// </summary>
[ApiController]
[Route("api/auth/mfa")]
[Produces("application/json")]
public sealed class MfaController : ControllerBase
{
    private static readonly JsonSerializerOptions JsonOpts = new();

    private readonly UserManager<AppUser> _userManager;
    private readonly IMfaService _mfa;
    private readonly IAppDbContext _db;
    private readonly IJwtTokenService _jwt;
    private readonly ICurrentUserService _currentUser;

    public MfaController(
        UserManager<AppUser> userManager,
        IMfaService mfa,
        IAppDbContext db,
        IJwtTokenService jwt,
        ICurrentUserService currentUser)
    {
        _userManager = userManager;
        _mfa = mfa;
        _db = db;
        _jwt = jwt;
        _currentUser = currentUser;
    }

    /// <summary>Generates a new TOTP secret + QR URI. Called by users who have not yet enabled MFA.</summary>
    [HttpPost("setup")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Setup(CancellationToken ct)
    {
        var userId = _currentUser.UserId;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var user = await _userManager.FindByIdAsync(userId);
        if (user is null) return Unauthorized();

        // If already enabled, short-circuit to avoid overwriting a live secret.
        var existing = await _db.UserMfaSettings.FirstOrDefaultAsync(x => x.UserId == userId, ct);
        if (existing is not null && existing.IsEnabled)
        {
            return Conflict(new { message = "MFA is already enabled for this user." });
        }

        var secret = _mfa.GenerateSecret();

        if (existing is null)
        {
            existing = new UserMfaSettings { UserId = userId, SecretKey = secret, IsEnabled = false, BackupCodes = "[]" };
            _db.UserMfaSettings.Add(existing);
        }
        else
        {
            existing.SecretKey = secret;
        }
        await _db.SaveChangesAsync(ct);

        var uri = _mfa.GetOtpAuthUri(secret, user.Email ?? user.UserName ?? "user");
        return Ok(new { secret, otpAuthUri = uri });
    }

    public record EnableMfaRequest(string Code);

    /// <summary>Verifies a 6-digit code and finalizes MFA enablement. Returns 10 plaintext backup codes once.</summary>
    [HttpPost("enable")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> Enable([FromBody] EnableMfaRequest request, CancellationToken ct)
    {
        var userId = _currentUser.UserId;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var settings = await _db.UserMfaSettings.FirstOrDefaultAsync(x => x.UserId == userId, ct);
        if (settings is null) return BadRequest(new { message = "MFA setup has not been initiated." });

        if (!_mfa.VerifyTotp(settings.SecretKey, request.Code))
            return BadRequest(new { message = "Invalid code." });

        var (plaintext, hashes) = _mfa.GenerateBackupCodes();
        settings.BackupCodes = JsonSerializer.Serialize(hashes, JsonOpts);
        settings.IsEnabled = true;
        settings.EnabledAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);

        return Ok(new { backupCodes = plaintext });
    }

    public record VerifyMfaRequest(string MfaPendingToken, string? Code, string? BackupCode);

    /// <summary>
    /// Accepts an <c>mfa_pending</c> token plus a 6-digit TOTP code or an unused backup code.
    /// On success returns a fully signed JWT (same shape as a normal login response).
    /// </summary>
    [HttpPost("verify")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Verify([FromBody] VerifyMfaRequest request, CancellationToken ct)
    {
        var userId = Identity.MfaPendingTokenReader.TryExtractUserId(request.MfaPendingToken);
        if (userId is null) return Unauthorized(new { message = "Invalid MFA session." });

        var user = await _userManager.FindByIdAsync(userId);
        if (user is null || !user.IsActive) return Unauthorized(new { message = "Invalid MFA session." });

        var settings = await _db.UserMfaSettings.FirstOrDefaultAsync(x => x.UserId == userId, ct);
        if (settings is null || !settings.IsEnabled)
            return Unauthorized(new { message = "MFA is not enabled for this account." });

        var ok = false;
        if (!string.IsNullOrWhiteSpace(request.Code))
        {
            ok = _mfa.VerifyTotp(settings.SecretKey, request.Code!);
        }
        else if (!string.IsNullOrWhiteSpace(request.BackupCode))
        {
            var hashed = JsonSerializer.Deserialize<List<string>>(settings.BackupCodes ?? "[]") ?? new List<string>();
            if (_mfa.TryConsumeBackupCode(hashed, request.BackupCode!))
            {
                settings.BackupCodes = JsonSerializer.Serialize(hashed, JsonOpts);
                ok = true;
            }
        }

        if (!ok) return Unauthorized(new { message = "Invalid code." });

        var (token, expiresAt) = _jwt.GenerateToken(user);
        var refreshValue = _jwt.GenerateRefreshToken();
        var refreshExpires = DateTime.UtcNow.AddDays(_jwt.RefreshTokenExpiresInDays);

        _db.RefreshTokens.Add(new Domain.Users.RefreshToken
        {
            UserId = user.Id,
            TokenHash = _jwt.HashToken(refreshValue),
            ExpiresAtUtc = refreshExpires,
            CreatedAtUtc = DateTime.UtcNow,
        });
        await _db.SaveChangesAsync(ct);

        return Ok(new Application.Auth.DTOs.AuthResponse(
            token,
            user.Email!,
            user.Role.ToString(),
            expiresAt,
            user.TenantId,
            user.RequirePasswordChange,
            user.HasCompletedOnboarding,
            user.FirstName,
            user.LastName,
            refreshValue,
            refreshExpires,
            IsSuperAdmin: user.IsSuperAdmin));
    }

    /// <summary>Invalidates all existing backup codes and returns a freshly generated set.</summary>
    [HttpPost("regenerate-backup-codes")]
    [Authorize]
    public async Task<IActionResult> RegenerateBackupCodes(CancellationToken ct)
    {
        var userId = _currentUser.UserId;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var settings = await _db.UserMfaSettings.FirstOrDefaultAsync(x => x.UserId == userId, ct);
        if (settings is null || !settings.IsEnabled)
            return BadRequest(new { message = "MFA is not enabled." });

        var (plaintext, hashes) = _mfa.GenerateBackupCodes();
        settings.BackupCodes = JsonSerializer.Serialize(hashes, JsonOpts);
        await _db.SaveChangesAsync(ct);

        return Ok(new { backupCodes = plaintext });
    }
}
