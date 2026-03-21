using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Fleet;
using AgroPlatform.Domain.Machinery;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AgroPlatform.Application.Machinery.Commands.IngestTeltonikaWebhook;

/// <summary>
/// Handles Teltonika GPS webhook ingestion.
/// </summary>
/// <remarks>
/// <para>
/// The handler resolves the machine by IMEI using
/// <c>IgnoreQueryFilters()</c> so that tenant filtering does not prevent
/// lookup when the request arrives without a tenant header.
/// </para>
/// <para>
/// If the IMEI is <b>known</b>: a <see cref="GpsTrack"/> is persisted and a
/// real-time position update is broadcast via <see cref="IFleetHubService"/>
/// using <c>machine.TenantId</c>.
/// </para>
/// <para>
/// If the IMEI is <b>unknown</b>: no track is persisted and
/// <see cref="Guid.Empty"/> is returned.
/// </para>
/// </remarks>
public class IngestTeltonikaWebhookHandler : IRequestHandler<IngestTeltonikaWebhookCommand, Guid>
{
    private readonly IAppDbContext _context;
    private readonly IFleetHubService _fleetHub;
    private readonly ILogger<IngestTeltonikaWebhookHandler> _logger;

    public IngestTeltonikaWebhookHandler(
        IAppDbContext context,
        IFleetHubService fleetHub,
        ILogger<IngestTeltonikaWebhookHandler> logger)
    {
        _context = context;
        _fleetHub = fleetHub;
        _logger = logger;
    }

    public async Task<Guid> Handle(
        IngestTeltonikaWebhookCommand request,
        CancellationToken cancellationToken)
    {
        // Resolve by IMEI ignoring all query filters (tenant + soft-delete).
        var machine = await _context.Machines
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(m => m.ImeiNumber == request.Imei, cancellationToken);

        if (machine is null)
        {
            _logger.LogWarning(
                "Teltonika webhook: unknown IMEI {Imei} — track not persisted.",
                request.Imei);
            return Guid.Empty;
        }

        var track = new GpsTrack
        {
            VehicleId = machine.Id,
            Lat = request.Lat,
            Lng = request.Lng,
            Speed = (decimal)request.Speed,
            FuelLevel = (decimal)request.FuelLevel,
            Timestamp = request.TimestampUtc,
            TenantId = machine.TenantId
        };

        _context.GpsTracks.Add(track);
        await _context.SaveChangesAsync(cancellationToken);

        await _fleetHub.BroadcastPositionAsync(
            machine.TenantId,
            new FleetPositionUpdate(
                machine.Id,
                request.Lat,
                request.Lng,
                request.Speed,
                request.FuelLevel,
                request.TimestampUtc,
                machine.Name,
                machine.Type.ToString()),
            cancellationToken);

        return track.Id;
    }
}
