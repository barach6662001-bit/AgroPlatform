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
            await _notifications.SendAsync(
                machine.TenantId,
                "warning",
                "Техніка за межами поля",
                $"Техніка '{machine.Name}' знаходиться за межами полів ({request.Lat:F5}, {request.Lng:F5})",
                cancellationToken);
        }

        return track.Id;
    }
}
