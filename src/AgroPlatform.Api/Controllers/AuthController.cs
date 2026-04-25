using AgroPlatform.Api.SuperAdmin;
using AgroPlatform.Application.Auth.Commands.ChangePassword;
using AgroPlatform.Application.Auth.Commands.CompleteOnboarding;
using AgroPlatform.Application.Auth.Commands.Login;
using AgroPlatform.Application.Auth.Commands.RefreshToken;
using AgroPlatform.Application.Auth.Commands.RevokeRefreshToken;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace AgroPlatform.Api.Controllers;

/// <summary>
/// Handles user authentication and password management.
/// Returns a JWT Bearer token that must be supplied in the <c>Authorization</c> header
/// for all protected endpoints.
/// </summary>
[ApiController]
[Route("api/auth")]
[Produces("application/json")]
public class AuthController : ControllerBase
{
    private readonly ISender _sender;

    /// <summary>Initializes a new instance of <see cref="AuthController"/>.</summary>
    public AuthController(ISender sender)
    {
        _sender = sender;
    }

    /// <summary>Authenticates an existing user and returns a JWT token.</summary>
    [HttpPost("login")]
    [AllowAnonymous]
    [EnableRateLimiting("auth-login")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> Login([FromBody] LoginCommand command, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(command, cancellationToken);
        return Ok(result);
    }

    /// <summary>Exchanges a valid refresh token for a new access + refresh token pair.</summary>
    [HttpPost("refresh")]
    [AllowAnonymous]
    [EnableRateLimiting("auth-login")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Refresh([FromBody] RefreshTokenCommand command, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(command, cancellationToken);
        return Ok(result);
    }

    /// <summary>Revokes a refresh token (used on logout).</summary>
    [HttpPost("revoke")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Revoke([FromBody] RevokeRefreshTokenCommand command, CancellationToken cancellationToken)
    {
        await _sender.Send(command, cancellationToken);
        return NoContent();
    }

    /// <summary>Changes the current user's password. Returns a new JWT token.</summary>
    [HttpPost("change-password")]
    [Authorize]
    [ForbiddenDuringImpersonation]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordCommand command, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(command, cancellationToken);
        return Ok(result);
    }

    /// <summary>Marks the current user as having completed the onboarding wizard.</summary>
    [HttpPost("complete-onboarding")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> CompleteOnboarding(CancellationToken cancellationToken)
    {
        await _sender.Send(new CompleteOnboardingCommand(), cancellationToken);
        return NoContent();
    }
}
