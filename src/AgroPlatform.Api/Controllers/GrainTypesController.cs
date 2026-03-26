using AgroPlatform.Application.GrainStorage.Commands.AddGrainType;
using AgroPlatform.Application.GrainStorage.Queries.GetGrainTypes;
using AgroPlatform.Domain.Authorization;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgroPlatform.Api.Controllers;

/// <summary>
/// Manages the grain type (crop variety) reference list.
/// </summary>
[ApiController]
[Authorize]
[Route("api/grain-types")]
[Produces("application/json")]
public class GrainTypesController : ControllerBase
{
    private readonly ISender _sender;

    /// <summary>Initializes a new instance of <see cref="GrainTypesController"/>.</summary>
    public GrainTypesController(ISender sender)
    {
        _sender = sender;
    }

    /// <summary>Returns the list of available grain types for the tenant (standard + custom).</summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetGrainTypes(CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetGrainTypesQuery(), cancellationToken);
        return Ok(result);
    }

    /// <summary>Adds a custom grain type for the current tenant.</summary>
    [HttpPost]
    [Authorize(Policy = Permissions.GrainStorage.Manage)]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<IActionResult> AddGrainType([FromBody] AddGrainTypeRequest request, CancellationToken cancellationToken)
    {
        var id = await _sender.Send(new AddGrainTypeCommand(request.Name), cancellationToken);
        return CreatedAtAction(nameof(GetGrainTypes), new { }, new { id });
    }
}

/// <summary>Request body for adding a custom grain type.</summary>
public record AddGrainTypeRequest(string Name);
