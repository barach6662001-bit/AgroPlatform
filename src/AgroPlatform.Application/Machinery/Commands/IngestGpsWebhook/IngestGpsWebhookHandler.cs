using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Fleet;
using AgroPlatform.Domain.Machinery;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;

namespace AgroPlatform.Application.Machinery.Commands.IngestGpsWebhook;

public class IngestGpsWebhookHandler : IRequestHandler<IngestGpsWebhookCommand, Guid>
{
    private readonly IAppDbContext _context;
    private readonly IFleetHubService _fleetHub;
    private readonly INotificationService _notifications;

    private const int GeofenceCooldownMinutes = 30;
    private const string GeofenceAlertTitle = "Техніка за межами поля";

    public IngestGpsWebhookHandler(IAppDbContext context, IFleetHubService fleetHub, INotificationService notifications)
    {
        _context = context;
        _fleetHub = fleetHub;
        _notifications = notifications;
    }

    public async Task<Guid> Handle(IngestGpsWebhookCommand request, CancellationToken cancellationToken)
    {
        // Bypass tenant filter to find machine across all tenants,
        // but explicitly exclude soft-deleted machines.
        var machine = await _context.Machines
            .IgnoreQueryFilters()
            .Where(m => !m.IsDeleted && m.ImeiNumber == request.DeviceId)
            .FirstOrDefaultAsync(cancellationToken);

        if (machine is null)
            return Guid.Empty;

        // Note: Heading is accepted in the payload and validated, but not yet persisted
        // because GpsTrack does not have a Heading column. Add a migration and the
        // GpsTrack.Heading property when heading storage is required (future task).
        var track = new GpsTrack
        {
            VehicleId = machine.Id,
            Lat = request.Lat,
            Lng = request.Lon,
            Speed = request.Speed,
            FuelLevel = request.Fuel ?? 0,
            Timestamp = request.Timestamp,
            TenantId = machine.TenantId
        };

        _context.GpsTracks.Add(track);
        await _context.SaveChangesAsync(cancellationToken);

        var update = new FleetPositionUpdate(
            VehicleId: machine.Id,
            Lat: request.Lat,
            Lng: request.Lon,
            Speed: (double)request.Speed,
            Fuel: (double)(request.Fuel ?? 0),
            TimestampUtc: request.Timestamp,
            MachineName: machine.Name,
            MachineType: machine.Type.ToString());

        await _fleetHub.BroadcastPositionAsync(machine.TenantId, update, cancellationToken);

        // Geofence evaluation: run after ingestion so a failure cannot break GPS data recording.
        try
        {
            await EvaluateGeofenceAsync(machine, request.Lat, request.Lon, cancellationToken);
        }
        catch
        {
            // Geofence failure must never crash the ingestion pipeline.
        }

        return track.Id;
    }

    private async Task EvaluateGeofenceAsync(Domain.Machinery.Machine machine, double lat, double lon, CancellationToken cancellationToken)
    {
        var point = new Point(lon, lat) { SRID = 4326 };

        // Check whether the position is inside any non-deleted field polygon for this tenant.
        var insideAnyField = await _context.Fields
            .IgnoreQueryFilters()
            .Where(f => !f.IsDeleted && f.TenantId == machine.TenantId && f.Geometry != null)
            .AnyAsync(f => f.Geometry!.Contains(point), cancellationToken);

        if (insideAnyField)
            return;

        // Anti-spam: suppress duplicate alerts while the machine remains outside.
        // We match on TenantId + Type + Title + machine name in Body so the same
        // machine name format used when creating the notification is matched here.
        // This avoids a separate migration/dedicated field for a first-version implementation.
        var cooldownStart = DateTime.UtcNow.AddMinutes(-GeofenceCooldownMinutes);
        var recentAlertExists = await _context.Notifications
            .IgnoreQueryFilters()
            .AnyAsync(n =>
                n.TenantId == machine.TenantId &&
                n.Type == "warning" &&
                n.Title == GeofenceAlertTitle &&
                n.Body.Contains(machine.Name) &&
                n.CreatedAtUtc >= cooldownStart,
                cancellationToken);

        if (recentAlertExists)
            return;

        await _notifications.SendAsync(
            machine.TenantId,
            "warning",
            GeofenceAlertTitle,
            $"Техніка '{machine.Name}' знаходиться за межами полів ({lat:F5}, {lon:F5})",
            cancellationToken);
    }
}
