using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Machinery;
using MediatR;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;

namespace AgroPlatform.Application.Machinery.Commands.AddGpsTrack;

public class AddGpsTrackHandler : IRequestHandler<AddGpsTrackCommand, Guid>
{
    private readonly IAppDbContext _context;
    private readonly INotificationService _notifications;

    private const int GeofenceCooldownMinutes = 30;
    private const string GeofenceAlertTitle = "Техніка за межами поля";

    public AddGpsTrackHandler(IAppDbContext context, INotificationService notifications)
    {
        _context = context;
        _notifications = notifications;
    }

    public async Task<Guid> Handle(AddGpsTrackCommand request, CancellationToken cancellationToken)
    {
        var machine = await _context.Machines
            .FirstOrDefaultAsync(m => m.Id == request.MachineId, cancellationToken)
            ?? throw new NotFoundException(nameof(Machine), request.MachineId);

        var track = new GpsTrack
        {
            VehicleId = request.MachineId,
            Lat = request.Lat,
            Lng = request.Lng,
            Speed = request.Speed,
            FuelLevel = request.FuelLevel,
            Timestamp = request.Timestamp
        };

        _context.GpsTracks.Add(track);
        await _context.SaveChangesAsync(cancellationToken);

        // Geofence check: is the GPS point inside any of the tenant's field polygons?
        var point = new Point(request.Lng, request.Lat) { SRID = 4326 };

        var insideField = await _context.Fields
            .Where(f => f.Geometry != null)
            .AnyAsync(f => f.Geometry!.Contains(point), cancellationToken);

        if (!insideField)
        {
            // Anti-spam: suppress duplicate alerts while the machine remains outside.
            // We match on TenantId + Type + Title + machine name in Body so the same
            // machine name format used when creating the notification is matched here.
            // This avoids a separate migration/dedicated field for a first-version implementation.
            var cooldownStart = DateTime.UtcNow.AddMinutes(-GeofenceCooldownMinutes);
            var recentAlertExists = await _context.Notifications
                .AnyAsync(n =>
                    n.TenantId == machine.TenantId &&
                    n.Type == "warning" &&
                    n.Title == GeofenceAlertTitle &&
                    n.Body.Contains(machine.Name) &&
                    n.CreatedAtUtc >= cooldownStart,
                    cancellationToken);

            if (!recentAlertExists)
            {
                await _notifications.SendAsync(
                    machine.TenantId,
                    "warning",
                    GeofenceAlertTitle,
                    $"Техніка '{machine.Name}' знаходиться за межами полів ({request.Lat:F5}, {request.Lng:F5})",
                    cancellationToken);
            }
        }

        return track.Id;
    }
}
