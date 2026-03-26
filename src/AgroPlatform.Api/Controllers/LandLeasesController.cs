using AgroPlatform.Application.Fields.Commands.AddLeasePayment;
using AgroPlatform.Application.Fields.Commands.CreateLandLease;
using AgroPlatform.Application.Fields.Commands.UpdateLandLease;
using AgroPlatform.Application.Fields.Queries.GetLeases;
using AgroPlatform.Application.Fields.Queries.GetLeasesSummary;
using AgroPlatform.Domain.Authorization;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgroPlatform.Api.Controllers;

/// <summary>
/// Manages land lease contracts and payments to landowners.
/// </summary>
[ApiController]
[Authorize]
[Route("api/land-leases")]
[Produces("application/json")]
public class LandLeasesController : ControllerBase
{
    private readonly ISender _sender;

    /// <summary>Initializes a new instance of <see cref="LandLeasesController"/>.</summary>
    public LandLeasesController(ISender sender)
    {
        _sender = sender;
    }

    /// <summary>Returns a list of land lease contracts, optionally filtered by field.</summary>
    /// <param name="fieldId">Optional field ID filter.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetLeases([FromQuery] Guid? fieldId, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetLeasesQuery(fieldId), cancellationToken);
        return Ok(result);
    }

    /// <summary>Returns a summary of lease payments for a given year.</summary>
    /// <param name="year">The year to summarize payments for.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    [HttpGet("summary")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSummary([FromQuery] int year, CancellationToken cancellationToken)
    {
        var result = await _sender.Send(new GetLeasesSummaryQuery(year), cancellationToken);
        return Ok(result);
    }

    /// <summary>Creates a new land lease contract for a field.</summary>
    /// <param name="command">Lease contract data (owner, annual payment, dates).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The ID of the created lease contract.</returns>
    [HttpPost]
    [Authorize(Policy = Permissions.HR.Manage)]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CreateLease([FromBody] CreateLandLeaseCommand command, CancellationToken cancellationToken)
    {
        var id = await _sender.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetLeases), new { fieldId = command.FieldId }, new { id });
    }

    /// <summary>Updates a land lease contract.</summary>
    /// <param name="id">Lease contract ID.</param>
    /// <param name="request">Updated lease data.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    [HttpPut("{id:guid}")]
    [Authorize(Policy = Permissions.HR.Manage)]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateLease(Guid id, [FromBody] UpdateLandLeaseRequest request, CancellationToken cancellationToken)
    {
        var command = new UpdateLandLeaseCommand(id, request.OwnerName, request.OwnerPhone, request.ContractNumber,
            request.AnnualPayment, request.PaymentType, request.GrainPaymentTons, request.ContractEndDate, request.Notes, request.IsActive);
        await _sender.Send(command, cancellationToken);
        return NoContent();
    }

    /// <summary>Registers a payment (or advance) for a land lease contract.</summary>
    /// <param name="id">Lease contract ID.</param>
    /// <param name="request">Payment data (year, amount, type, date).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The ID of the created payment record.</returns>
    [HttpPost("{id:guid}/payments")]
    [Authorize(Policy = Permissions.HR.Manage)]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AddPayment(Guid id, [FromBody] AddLeasePaymentRequest request, CancellationToken cancellationToken)
    {
        var command = new AddLeasePaymentCommand(
            id,
            request.Year,
            request.Amount,
            request.PaymentType,
            request.PaymentMethod ?? "Cash",
            request.PaymentDate,
            request.GrainBatchId,
            request.GrainQuantityTons,
            request.GrainPricePerTon,
            request.Notes);
        var paymentId = await _sender.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetLeases), new { }, new { id = paymentId });
    }
}

/// <summary>Request body for adding a lease payment.</summary>
public record AddLeasePaymentRequest(
    int Year,
    decimal Amount,
    string PaymentType,
    DateTime PaymentDate,
    string? PaymentMethod,
    Guid? GrainBatchId,
    decimal? GrainQuantityTons,
    decimal? GrainPricePerTon,
    string? Notes);

/// <summary>Request body for updating a land lease contract.</summary>
public record UpdateLandLeaseRequest(
    string OwnerName,
    string? OwnerPhone,
    string? ContractNumber,
    decimal AnnualPayment,
    string PaymentType,
    decimal? GrainPaymentTons,
    DateTime? ContractEndDate,
    string? Notes,
    bool IsActive
);
