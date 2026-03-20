using AgroPlatform.Application.Fields.Commands.CreateVraMap;
using AgroPlatform.Application.Fields.Commands.DeleteVraMap;
using AgroPlatform.Application.Fields.Queries.ExportVraMapCsv;
using AgroPlatform.Application.Fields.Queries.GetVraMapById;
using AgroPlatform.Application.Fields.Queries.GetVraMaps;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgroPlatform.Api.Controllers;

/// <summary>
/// Manages Variable Rate Application (VRA) maps for a field.
/// Each map is derived from NDVI and soil-analysis data and specifies
/// per-zone fertilizer rates (kg/ha) for the on-board computer.
/// </summary>
[ApiController]
[Authorize]
[Route("api/fields/{fieldId:guid}/vra-maps")]
[Produces("application/json")]
public class VraMapsController : ControllerBase
{
    private readonly ISender _sender;

    /// <summary>Initializes a new instance of <see cref="VraMapsController"/>.</summary>
    public VraMapsController(ISender sender)
    {
        _sender = sender;
    }

    /// <summary>Returns all VRA maps for a field, optionally filtered by year.</summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetVraMaps(Guid fieldId, [FromQuery] int? year, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetVraMapsQuery(fieldId, year), cancellationToken);
        return Ok(result);
    }

    /// <summary>Returns a single VRA map by ID.</summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetVraMap(Guid fieldId, Guid id, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetVraMapByIdQuery(id), cancellationToken);
        if (result == null || result.FieldId != fieldId)
            return NotFound();
        return Ok(result);
    }

    /// <summary>Creates a new VRA map for a field.</summary>
    [HttpPost]
    [Authorize(Roles = "Administrator,Manager,Agronomist")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CreateVraMap(Guid fieldId, [FromBody] CreateVraMapCommand command, CancellationToken cancellationToken)
    {
        if (fieldId != command.FieldId)
            return BadRequest(new { error = "fieldId mismatch" });

        var id = await _sender.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetVraMap), new { fieldId, id }, new { id });
    }

    /// <summary>Deletes a VRA map.</summary>
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Administrator,Manager,Agronomist")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteVraMap(Guid fieldId, Guid id, CancellationToken cancellationToken)
    {
        await _sender.Send(new DeleteVraMapCommand(id), cancellationToken);
        return NoContent();
    }

    /// <summary>
    /// Exports a VRA map as CSV (UTF-8) for the on-board computer.
    /// Columns: ZoneIndex, ZoneName, NdviValue, SoilOrganicMatter, SoilNitrogen,
    /// SoilPhosphorus, SoilPotassium, AreaHectares, RateKgPerHa.
    /// </summary>
    [HttpGet("{id:guid}/export-csv")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ExportVraMapCsv(Guid fieldId, Guid id, CancellationToken cancellationToken)
    {
        var bytes = await _sender.Send(new ExportVraMapCsvQuery(id), cancellationToken);
        return File(bytes, "text/csv", $"vra-map-{id}.csv");
    }
}
