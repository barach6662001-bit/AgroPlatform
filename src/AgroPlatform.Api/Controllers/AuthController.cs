using AgroPlatform.Application.Auth.Commands.Login;
using AgroPlatform.Application.Auth.Commands.Register;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace AgroPlatform.Api.Controllers;

/// <summary>
/// Handles user registration and authentication.
/// Returns a JWT Bearer token that must be supplied in the <c>Authorization</c> header
/// for all protected endpoints.
/// </summary>
[ApiController]
[Route("api/auth")]
[AllowAnonymous]
[Produces("application/json")]
public class AuthController : ControllerBase
{
    private readonly ISender _sender;

    /// <summary>Initializes a new instance of <see cref="AuthController"/>.</summary>
    public AuthController(ISender sender)
    {
        _sender = sender;
    }

    /// <summary>Registers a new user account.</summary>
    /// <param name="command">Registration data (email, password, tenant ID).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A JWT token response on success.</returns>
    [HttpPost("register")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> Register([FromBody] RegisterCommand command, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(command, cancellationToken);
        return Ok(result);
    }

    /// <summary>Authenticates an existing user and returns a JWT token.</summary>
    /// <param name="command">Login credentials (email, password).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>A JWT token response on success.</returns>
    [HttpPost("login")]
    [EnableRateLimiting("auth-login")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> Login([FromBody] LoginCommand command, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(command, cancellationToken);
        return Ok(result);
    }
}
