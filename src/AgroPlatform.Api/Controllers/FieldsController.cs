using AgroPlatform.Application.Fields.Commands.AssignCrop;
using AgroPlatform.Application.Fields.Commands.CreateField;
using AgroPlatform.Application.Fields.Commands.CreateFieldFertilizer;
using AgroPlatform.Application.Fields.Commands.CreateFieldHarvest;
using AgroPlatform.Application.Fields.Commands.CreateFieldInspection;
using AgroPlatform.Application.Fields.Commands.CreateFieldProtection;
using AgroPlatform.Application.Fields.Commands.CreateFieldSeeding;
using AgroPlatform.Application.Fields.Commands.CreateFieldZone;
using AgroPlatform.Application.Fields.Commands.CreateSoilAnalysis;
using AgroPlatform.Application.Fields.Commands.DeleteField;
using AgroPlatform.Application.Fields.Commands.DeleteFieldFertilizer;
using AgroPlatform.Application.Fields.Commands.DeleteFieldHarvest;
using AgroPlatform.Application.Fields.Commands.DeleteFieldInspection;
using AgroPlatform.Application.Fields.Commands.DeleteFieldProtection;
using AgroPlatform.Application.Fields.Commands.DeleteFieldSeeding;
using AgroPlatform.Application.Fields.Commands.DeleteFieldZone;
using AgroPlatform.Application.Fields.Commands.DeleteRotationPlan;
using AgroPlatform.Application.Fields.Commands.DeleteSoilAnalysis;
using AgroPlatform.Application.Fields.Commands.PlanRotation;
using AgroPlatform.Application.Fields.Commands.UpdateField;
using AgroPlatform.Application.Fields.Commands.UpdateFieldGeometry;
using AgroPlatform.Application.Fields.Commands.UpdateFieldZone;
using AgroPlatform.Application.Fields.Commands.UpdateSoilAnalysis;
using AgroPlatform.Application.Fields.Commands.UpdateYield;
using AgroPlatform.Application.Fields.Queries.GetFieldById;
using AgroPlatform.Application.Fields.Queries.GetFieldFertilizers;
using AgroPlatform.Application.Fields.Queries.GetFieldHarvests;
using AgroPlatform.Application.Fields.Queries.GetFieldInspections;
using AgroPlatform.Application.Fields.Queries.GetFieldProtections;
using AgroPlatform.Application.Fields.Queries.GetFieldSeedings;
using AgroPlatform.Application.Fields.Queries.GetFieldZones;
using AgroPlatform.Application.Fields.Queries.GetFields;
using AgroPlatform.Application.Fields.Queries.GetPrescriptionMap;
using AgroPlatform.Application.Fields.Queries.GetSoilAnalyses;
using AgroPlatform.Application.Fields.Queries.ExportPrescriptionMap;
using AgroPlatform.Application.Fields.Queries.GetRotationAdvice;
using AgroPlatform.Domain.Authorization;
using AgroPlatform.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgroPlatform.Api.Controllers;

/// <summary>
/// Manages agricultural fields — cadastral data, current crop, crop history,
/// yield records and rotation plans.
/// </summary>
[ApiController]
[Authorize]
[Route("api/fields")]
[Produces("application/json")]
public class FieldsController : ControllerBase
{
    private readonly ISender _sender;

    /// <summary>Initializes a new instance of <see cref="FieldsController"/>.</summary>
    public FieldsController(ISender sender)
    {
        _sender = sender;
    }

    /// <summary>Creates a new field.</summary>
    /// <param name="command">Field creation data (name, area, cadastral number).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The ID of the created field.</returns>
    [HttpPost]
    [Authorize(Policy = Permissions.Fields.Manage)]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateField([FromBody] CreateFieldCommand command, CancellationToken cancellationToken)
    {
        var id = await _sender.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetField), new { id }, new { id });
    }

    /// <summary>Returns a paginated list of fields, optionally filtered by current crop or search term.</summary>
    /// <param name="currentCrop">Optional crop type filter.</param>
    /// <param name="searchTerm">Optional free-text search (name, cadastral number).</param>
    /// <param name="page">Page number (1-based, default 1).</param>
    /// <param name="pageSize">Page size (default 20).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetFields([FromQuery] CropType? currentCrop, [FromQuery] string? searchTerm, [FromQuery] int[]? ownershipType, [FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken cancellationToken = default)
    {
        LandOwnershipType[]? ownershipTypes = ownershipType?.Select(v => (LandOwnershipType)v).ToArray();
        var result = await _sender.Send(new GetFieldsQuery(currentCrop, searchTerm, page, pageSize, ownershipTypes), cancellationToken);
        return Ok(result);
    }

    /// <summary>Returns detailed information about a single field including crop history.</summary>
    /// <param name="id">Field ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetField(Guid id, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetFieldByIdQuery(id), cancellationToken);
        if (result == null)
            return NotFound();
        return Ok(result);
    }

    /// <summary>Updates field data (name, area, cadastral number).</summary>
    /// <param name="id">Field ID (must match the ID in the request body).</param>
    /// <param name="command">Updated field data.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    [HttpPut("{id:guid}")]
    [Authorize(Policy = Permissions.Fields.Manage)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateField(Guid id, [FromBody] UpdateFieldCommand command, CancellationToken cancellationToken)
    {
        if (id != command.Id)
            return BadRequest();

        await _sender.Send(command, cancellationToken);
        return NoContent();
    }

    /// <summary>Soft-deletes a field.</summary>
    /// <param name="id">Field ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    [HttpDelete("{id:guid}")]
    [Authorize(Policy = Permissions.Fields.Manage)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteField(Guid id, CancellationToken cancellationToken)
    {
        await _sender.Send(new DeleteFieldCommand(id), cancellationToken);
        return NoContent();
    }

    /// <summary>Assigns a crop to a field, creating a new crop history entry.</summary>
    /// <param name="command">Crop assignment data (field, crop type, sowing date).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The ID of the created crop history entry.</returns>
    [HttpPost("assign-crop")]
    [Authorize(Policy = Permissions.Fields.Manage)]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<IActionResult> AssignCrop([FromBody] AssignCropCommand command, CancellationToken cancellationToken)
    {
        var id = await _sender.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetField), new { id = command.FieldId }, new { id });
    }

    /// <summary>Updates the actual yield for a crop history entry.</summary>
    /// <param name="cropHistoryId">Crop history entry ID (must match the ID in the request body).</param>
    /// <param name="command">Yield data.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    [HttpPut("crop-history/{cropHistoryId:guid}/yield")]
    [Authorize(Policy = Permissions.Fields.Manage)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateYield(Guid cropHistoryId, [FromBody] UpdateYieldCommand command, CancellationToken cancellationToken)
    {
        if (cropHistoryId != command.CropHistoryId)
            return BadRequest();

        await _sender.Send(command, cancellationToken);
        return NoContent();
    }

    /// <summary>Creates a crop rotation plan for a field.</summary>
    /// <param name="command">Rotation plan data (field, planned crop, planned year).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The ID of the created rotation plan.</returns>
    [HttpPost("rotation-plans")]
    [Authorize(Policy = Permissions.Fields.Manage)]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<IActionResult> PlanRotation([FromBody] PlanRotationCommand command, CancellationToken cancellationToken)
    {
        var id = await _sender.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetField), new { id = command.FieldId }, new { id });
    }

    /// <summary>Deletes a crop rotation plan.</summary>
    /// <param name="planId">Rotation plan ID.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    [HttpDelete("rotation-plans/{planId:guid}")]
    [Authorize(Policy = Permissions.Fields.Manage)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteRotationPlan(Guid planId, CancellationToken cancellationToken)
    {
        await _sender.Send(new DeleteRotationPlanCommand(planId), cancellationToken);
        return NoContent();
    }

    /// <summary>Updates the GeoJSON polygon geometry of a field.</summary>
    /// <param name="id">Field ID.</param>
    /// <param name="request">GeoJSON body.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    [HttpPut("{id:guid}/geometry")]
    [Authorize(Policy = Permissions.Fields.Manage)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UpdateGeometry(
        Guid id,
        [FromBody] UpdateFieldGeometryRequest request,
        CancellationToken cancellationToken)
    {
        await _sender.Send(new UpdateFieldGeometryCommand(id, request.GeoJson), cancellationToken);
        return NoContent();
    }

    // ─── Seedings ───────────────────────────────────────────────────────────────

    /// <summary>Returns seeding records for a field.</summary>
    [HttpGet("{fieldId:guid}/seedings")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSeedings(Guid fieldId, [FromQuery] int? year, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetFieldSeedingsQuery(fieldId, year), cancellationToken);
        return Ok(result);
    }

    /// <summary>Creates a seeding record for a field.</summary>
    [HttpPost("{fieldId:guid}/seedings")]
    [Authorize(Policy = Permissions.Fields.Manage)]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateSeeding(Guid fieldId, [FromBody] CreateFieldSeedingRequest request, CancellationToken cancellationToken)
    {
        var id = await _sender.Send(new CreateFieldSeedingCommand(
            fieldId, request.Year, request.CropName, request.Variety,
            request.SeedingRateKgPerHa, request.TotalSeedKg, request.SeedingDate, request.Notes), cancellationToken);
        return CreatedAtAction(nameof(GetField), new { id = fieldId }, new { id });
    }

    /// <summary>Deletes a seeding record.</summary>
    [HttpDelete("{fieldId:guid}/seedings/{id:guid}")]
    [Authorize(Policy = Permissions.Fields.Manage)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteSeeding(Guid fieldId, Guid id, CancellationToken cancellationToken)
    {
        await _sender.Send(new DeleteFieldSeedingCommand(id), cancellationToken);
        return NoContent();
    }

    // ─── Fertilizers ────────────────────────────────────────────────────────────

    /// <summary>Returns fertilizer records for a field.</summary>
    [HttpGet("{fieldId:guid}/fertilizers")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetFertilizers(Guid fieldId, [FromQuery] int? year, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetFieldFertilizersQuery(fieldId, year), cancellationToken);
        return Ok(result);
    }

    /// <summary>Creates a fertilizer record for a field.</summary>
    [HttpPost("{fieldId:guid}/fertilizers")]
    [Authorize(Policy = Permissions.Fields.Manage)]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateFertilizer(Guid fieldId, [FromBody] CreateFieldFertilizerRequest request, CancellationToken cancellationToken)
    {
        var id = await _sender.Send(new CreateFieldFertilizerCommand(
            fieldId, request.Year, request.FertilizerName, request.ApplicationType,
            request.RateKgPerHa, request.TotalKg, request.CostPerKg, request.TotalCost,
            request.ApplicationDate, request.Notes), cancellationToken);
        return CreatedAtAction(nameof(GetField), new { id = fieldId }, new { id });
    }

    /// <summary>Deletes a fertilizer record.</summary>
    [HttpDelete("{fieldId:guid}/fertilizers/{id:guid}")]
    [Authorize(Policy = Permissions.Fields.Manage)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteFertilizer(Guid fieldId, Guid id, CancellationToken cancellationToken)
    {
        await _sender.Send(new DeleteFieldFertilizerCommand(id), cancellationToken);
        return NoContent();
    }

    // ─── Protections ────────────────────────────────────────────────────────────

    /// <summary>Returns plant protection records for a field.</summary>
    [HttpGet("{fieldId:guid}/protections")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetProtections(Guid fieldId, [FromQuery] int? year, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetFieldProtectionsQuery(fieldId, year), cancellationToken);
        return Ok(result);
    }

    /// <summary>Creates a plant protection record for a field.</summary>
    [HttpPost("{fieldId:guid}/protections")]
    [Authorize(Policy = Permissions.Fields.Manage)]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateProtection(Guid fieldId, [FromBody] CreateFieldProtectionRequest request, CancellationToken cancellationToken)
    {
        var id = await _sender.Send(new CreateFieldProtectionCommand(
            fieldId, request.Year, request.ProductName, request.ProtectionType,
            request.RateLPerHa, request.TotalLiters, request.CostPerLiter, request.TotalCost,
            request.ApplicationDate, request.Notes), cancellationToken);
        return CreatedAtAction(nameof(GetField), new { id = fieldId }, new { id });
    }

    /// <summary>Deletes a plant protection record.</summary>
    [HttpDelete("{fieldId:guid}/protections/{id:guid}")]
    [Authorize(Policy = Permissions.Fields.Manage)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteProtection(Guid fieldId, Guid id, CancellationToken cancellationToken)
    {
        await _sender.Send(new DeleteFieldProtectionCommand(id), cancellationToken);
        return NoContent();
    }

    // ─── Harvests ───────────────────────────────────────────────────────────────

    /// <summary>Returns harvest records for a field.</summary>
    [HttpGet("{fieldId:guid}/harvests")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetHarvests(Guid fieldId, [FromQuery] int? year, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetFieldHarvestsQuery(fieldId, year), cancellationToken);
        return Ok(result);
    }

    /// <summary>Creates a harvest record for a field. Yield t/ha and total revenue are calculated automatically.</summary>
    [HttpPost("{fieldId:guid}/harvests")]
    [Authorize(Policy = Permissions.Fields.Manage)]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateHarvest(Guid fieldId, [FromBody] CreateFieldHarvestRequest request, CancellationToken cancellationToken)
    {
        var id = await _sender.Send(new CreateFieldHarvestCommand(
            fieldId, request.Year, request.CropName, request.TotalTons,
            request.MoisturePercent, request.PricePerTon, request.HarvestDate, request.Notes), cancellationToken);
        return CreatedAtAction(nameof(GetField), new { id = fieldId }, new { id });
    }

    /// <summary>Deletes a harvest record.</summary>
    [HttpDelete("{fieldId:guid}/harvests/{id:guid}")]
    [Authorize(Policy = Permissions.Fields.Manage)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteHarvest(Guid fieldId, Guid id, CancellationToken cancellationToken)
    {
        await _sender.Send(new DeleteFieldHarvestCommand(id), cancellationToken);
        return NoContent();
    }

    // ─── Zones ──────────────────────────────────────────────────────────────────

    /// <summary>Returns management zones for a field.</summary>
    [HttpGet("{fieldId:guid}/zones")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetZones(Guid fieldId, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetFieldZonesQuery(fieldId), cancellationToken);
        return Ok(result);
    }

    /// <summary>Creates a management zone for a field.</summary>
    [HttpPost("{fieldId:guid}/zones")]
    [Authorize(Policy = Permissions.Fields.Manage)]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateZone(Guid fieldId, [FromBody] CreateFieldZoneRequest request, CancellationToken cancellationToken)
    {
        var id = await _sender.Send(new CreateFieldZoneCommand(
            fieldId, request.Name, request.GeoJson, request.SoilType, request.Notes), cancellationToken);
        return CreatedAtAction(nameof(GetField), new { id = fieldId }, new { id });
    }

    /// <summary>Updates a management zone.</summary>
    [HttpPut("{fieldId:guid}/zones/{id:guid}")]
    [Authorize(Policy = Permissions.Fields.Manage)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateZone(Guid fieldId, Guid id, [FromBody] CreateFieldZoneRequest request, CancellationToken cancellationToken)
    {
        await _sender.Send(new UpdateFieldZoneCommand(id, request.Name, request.GeoJson, request.SoilType, request.Notes), cancellationToken);
        return NoContent();
    }

    /// <summary>Deletes a management zone.</summary>
    [HttpDelete("{fieldId:guid}/zones/{id:guid}")]
    [Authorize(Policy = Permissions.Fields.Manage)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteZone(Guid fieldId, Guid id, CancellationToken cancellationToken)
    {
        await _sender.Send(new DeleteFieldZoneCommand(id), cancellationToken);
        return NoContent();
    }

    // ─── Soil Analyses ──────────────────────────────────────────────────────────

    /// <summary>Returns soil analysis records for a field.</summary>
    [HttpGet("{fieldId:guid}/soil-analyses")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSoilAnalyses(Guid fieldId, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetSoilAnalysesQuery(fieldId), cancellationToken);
        return Ok(result);
    }

    /// <summary>Creates a soil analysis record for a field.</summary>
    [HttpPost("{fieldId:guid}/soil-analyses")]
    [Authorize(Policy = Permissions.Fields.Manage)]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateSoilAnalysis(Guid fieldId, [FromBody] CreateSoilAnalysisRequest request, CancellationToken cancellationToken)
    {
        var id = await _sender.Send(new CreateSoilAnalysisCommand(
            fieldId, request.ZoneId, request.SampleDate, request.pH,
            request.Nitrogen, request.Phosphorus, request.Potassium,
            request.Humus, request.Notes), cancellationToken);
        return CreatedAtAction(nameof(GetField), new { id = fieldId }, new { id });
    }

    /// <summary>Updates a soil analysis record.</summary>
    [HttpPut("{fieldId:guid}/soil-analyses/{id:guid}")]
    [Authorize(Policy = Permissions.Fields.Manage)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateSoilAnalysis(Guid fieldId, Guid id, [FromBody] UpdateSoilAnalysisRequest request, CancellationToken cancellationToken)
    {
        await _sender.Send(new UpdateSoilAnalysisCommand(
            id, request.ZoneId, request.SampleDate, request.pH,
            request.Nitrogen, request.Phosphorus, request.Potassium,
            request.Humus, request.Notes), cancellationToken);
        return NoContent();
    }

    /// <summary>Deletes a soil analysis record.</summary>
    [HttpDelete("{fieldId:guid}/soil-analyses/{id:guid}")]
    [Authorize(Policy = Permissions.Fields.Manage)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteSoilAnalysis(Guid fieldId, Guid id, CancellationToken cancellationToken)
    {
        await _sender.Send(new DeleteSoilAnalysisCommand(id), cancellationToken);
        return NoContent();
    }

    // ─── Inspections ─────────────────────────────────────────────────────────────

    /// <summary>Returns inspection records for a field.</summary>
    [HttpGet("{fieldId:guid}/inspections")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetInspections(Guid fieldId, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetFieldInspectionsQuery(fieldId), cancellationToken);
        return Ok(result);
    }

    /// <summary>Creates an inspection record for a field.</summary>
    [HttpPost("{fieldId:guid}/inspections")]
    [Authorize(Policy = Permissions.Fields.Manage)]
    [ProducesResponseType(StatusCodes.Status201Created)]
    public async Task<IActionResult> CreateInspection(Guid fieldId, [FromBody] CreateFieldInspectionRequest request, CancellationToken cancellationToken)
    {
        var id = await _sender.Send(new CreateFieldInspectionCommand(
            fieldId, request.Date, request.InspectorName, request.Notes,
            request.Severity, request.Latitude, request.Longitude, request.PhotoUrl), cancellationToken);
        return CreatedAtAction(nameof(GetField), new { id = fieldId }, new { id });
    }

    /// <summary>Deletes an inspection record.</summary>
    [HttpDelete("{fieldId:guid}/inspections/{id:guid}")]
    [Authorize(Policy = Permissions.Fields.Manage)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteInspection(Guid fieldId, Guid id, CancellationToken cancellationToken)
    {
        await _sender.Send(new DeleteFieldInspectionCommand(id), cancellationToken);
        return NoContent();
    }

    // ─── Prescription Map ────────────────────────────────────────────────────

    /// <summary>Returns a variable-rate prescription map combining soil analysis and NDVI date for a field.</summary>
    [HttpGet("{fieldId:guid}/prescription-map")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPrescriptionMap(
        Guid fieldId,
        [FromQuery] string nutrient = "Nitrogen",
        [FromQuery] string? ndviDate = null,
        CancellationToken cancellationToken = default)
    {
        var result = await _sender.Send(new GetPrescriptionMapQuery(fieldId, nutrient, ndviDate), cancellationToken);
        return Ok(result);
    }

    /// <summary>Exports a variable-rate prescription map as CSV for use with on-board precision agriculture computers.</summary>
    [HttpGet("{fieldId:guid}/prescription-map/export")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> ExportPrescriptionMap(
        Guid fieldId,
        [FromQuery] string nutrient = "Nitrogen",
        [FromQuery] string? ndviDate = null,
        CancellationToken cancellationToken = default)
    {
        var result = await _sender.Send(new ExportPrescriptionMapQuery(fieldId, nutrient, ndviDate), cancellationToken);
        return File(result.Content, result.ContentType, result.FileName);
    }

    /// <summary>Returns rule-based crop rotation advice for all fields based on seeding history.</summary>
    /// <param name="years">Number of past years of seeding history to analyse (default 3).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    [HttpGet("rotation-advice")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetRotationAdvice([FromQuery] int years = 3, CancellationToken cancellationToken = default)
    {
        var result = await _sender.Send(new GetRotationAdviceQuery(years), cancellationToken);
        return Ok(result);
    }
}

/// <summary>Request body for updating a field's GeoJSON geometry.</summary>
public record UpdateFieldGeometryRequest(string GeoJson);

/// <summary>Request body for creating a seeding record.</summary>
public record CreateFieldSeedingRequest(
    int Year,
    string CropName,
    string? Variety,
    decimal? SeedingRateKgPerHa,
    decimal? TotalSeedKg,
    DateTime? SeedingDate,
    string? Notes);

/// <summary>Request body for creating a fertilizer record.</summary>
public record CreateFieldFertilizerRequest(
    int Year,
    string FertilizerName,
    string? ApplicationType,
    decimal? RateKgPerHa,
    decimal? TotalKg,
    decimal? CostPerKg,
    decimal? TotalCost,
    DateTime ApplicationDate,
    string? Notes);

/// <summary>Request body for creating a plant protection record.</summary>
public record CreateFieldProtectionRequest(
    int Year,
    string ProductName,
    string? ProtectionType,
    decimal? RateLPerHa,
    decimal? TotalLiters,
    decimal? CostPerLiter,
    decimal? TotalCost,
    DateTime ApplicationDate,
    string? Notes);

/// <summary>Request body for creating a harvest record.</summary>
public record CreateFieldHarvestRequest(
    int Year,
    string CropName,
    decimal TotalTons,
    decimal? MoisturePercent,
    decimal? PricePerTon,
    DateTime HarvestDate,
    string? Notes);

/// <summary>Request body for creating or updating a management zone.</summary>
public record CreateFieldZoneRequest(
    string Name,
    string? GeoJson,
    string? SoilType,
    string? Notes);

/// <summary>Request body for creating a soil analysis record.</summary>
public record CreateSoilAnalysisRequest(
    Guid? ZoneId,
    DateTime SampleDate,
    decimal? pH,
    decimal? Nitrogen,
    decimal? Phosphorus,
    decimal? Potassium,
    decimal? Humus,
    string? Notes);

/// <summary>Request body for updating a soil analysis record.</summary>
public record UpdateSoilAnalysisRequest(
    Guid? ZoneId,
    DateTime SampleDate,
    decimal? pH,
    decimal? Nitrogen,
    decimal? Phosphorus,
    decimal? Potassium,
    decimal? Humus,
    string? Notes);

/// <summary>Request body for creating a field inspection record.</summary>
public record CreateFieldInspectionRequest(
    DateTime Date,
    string InspectorName,
    string? Notes,
    string? Severity,
    double? Latitude,
    double? Longitude,
    string? PhotoUrl);
