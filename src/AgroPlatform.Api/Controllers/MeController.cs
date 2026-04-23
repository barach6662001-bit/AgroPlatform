using System.Security.Claims;
using AgroPlatform.Application.Common.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgroPlatform.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/me")]
[Produces("application/json")]
public sealed class MeController : ControllerBase
{
    private readonly IFeatureFlagService _featureFlags;

    public MeController(IFeatureFlagService featureFlags)
    {
        _featureFlags = featureFlags;
    }

    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> Get(CancellationToken cancellationToken)
    {
        var features = await _featureFlags.GetCurrentTenantFeaturesAsync(cancellationToken);

        var tenantIdClaim = User.FindFirstValue("TenantId");
        Guid.TryParse(tenantIdClaim, out var tenantId);

        return Ok(new
        {
            email = User.FindFirstValue(ClaimTypes.Email) ?? string.Empty,
            role = User.FindFirstValue(ClaimTypes.Role) ?? string.Empty,
            tenantId,
            firstName = User.FindFirstValue("first_name") ?? string.Empty,
            lastName = User.FindFirstValue("last_name") ?? string.Empty,
            features,
        });
    }
}