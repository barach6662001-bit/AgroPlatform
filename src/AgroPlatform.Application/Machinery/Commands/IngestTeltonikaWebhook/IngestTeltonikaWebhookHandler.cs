using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Fleet;
using AgroPlatform.Domain.Machinery;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Machinery.Commands.IngestTeltonikaWebhook;

public class IngestTeltonikaWebhookHandler : IRequestHandler<IngestTeltonikaWebhookCommand, Guid>
{
    private readonly IAppDbContext _context;
    private readonly IFleetHubService _fleetHub;

    public IngestTeltonikaWebhookHandler(IAppDbContext context, IFleetHubService fleetHub)
    {
        _context = context;
        _fleetHub = fleetHub;
    }

    public async Task<Guid> Handle(IngestTeltonikaWebhookCommand request, CancellationToken cancellationToken)
    {
        // Bypass tenant filter to find machine across all tenants,
        // but explicitly exclude soft-deleted machines.
        var machine = await _context.Machines
            .IgnoreQueryFilters()
            .Where(m => !m.IsDeleted && m.ImeiNumber == request.Imei)
            .FirstOrDefaultAsync(cancellationToken);

        if (machine is null)
            return Guid.Empty;

        var track = new GpsTrack
        {
            VehicleId = machine.Id,
            Lat = request.Latitude,
            Lng = request.Longitude,
            Speed = request.Speed,
            FuelLevel = request.FuelLevel,
            Timestamp = request.TimestampUtc,
            TenantId = machine.TenantId
        };

        _context.GpsTracks.Add(track);
        await _context.SaveChangesAsync(cancellationToken);

        var update = new FleetPositionUpdate(
            VehicleId: machine.Id,
            Lat: request.Latitude,
            Lng: request.Longitude,
            Speed: (double)request.Speed,
            Fuel: (double)request.FuelLevel,
            TimestampUtc: request.TimestampUtc,
            MachineName: machine.Name,
            MachineType: machine.Type.ToString());

        await _fleetHub.BroadcastPositionAsync(machine.TenantId, update, cancellationToken);

        return track.Id;
    }
}
