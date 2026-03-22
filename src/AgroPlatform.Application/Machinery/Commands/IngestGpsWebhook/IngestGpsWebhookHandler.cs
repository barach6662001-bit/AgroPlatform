using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Fleet;
using AgroPlatform.Domain.Machinery;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Machinery.Commands.IngestGpsWebhook;

public class IngestGpsWebhookHandler : IRequestHandler<IngestGpsWebhookCommand, Guid>
{
    private readonly IAppDbContext _context;
    private readonly IFleetHubService _fleetHub;

    public IngestGpsWebhookHandler(IAppDbContext context, IFleetHubService fleetHub)
    {
        _context = context;
        _fleetHub = fleetHub;
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

        return track.Id;
    }
}
