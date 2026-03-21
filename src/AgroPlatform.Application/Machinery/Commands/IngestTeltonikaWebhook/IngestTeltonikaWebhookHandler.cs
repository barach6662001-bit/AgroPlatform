using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Fleet;
using AgroPlatform.Domain.Machinery;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AgroPlatform.Application.Machinery.Commands.IngestTeltonikaWebhook;

public class IngestTeltonikaWebhookHandler : IRequestHandler<IngestTeltonikaWebhookCommand, Guid>
{
    private readonly IAppDbContext _context;
    private readonly IFleetHubService _fleetHubService;
    private readonly ILogger<IngestTeltonikaWebhookHandler> _logger;

    public IngestTeltonikaWebhookHandler(
        IAppDbContext context,
        IFleetHubService fleetHubService,
        ILogger<IngestTeltonikaWebhookHandler> logger)
    {
        _context = context;
        _fleetHubService = fleetHubService;
        _logger = logger;
    }

    public async Task<Guid> Handle(IngestTeltonikaWebhookCommand request, CancellationToken cancellationToken)
    {
        // Look up machine by IMEI — raw ingestion, no hard failure if not found
        var machine = await _context.Machines
            .AsNoTracking()
            .FirstOrDefaultAsync(m => m.ImeiNumber == request.Imei, cancellationToken);

        if (machine is null)
        {
            _logger.LogWarning(
                "Teltonika webhook: no machine found for IMEI {Imei}; track not persisted",
                request.Imei);
            return Guid.Empty;
        }

        var track = new GpsTrack
        {
            VehicleId = machine.Id,
            Lat = request.Lat,
            Lng = request.Lng,
            Speed = request.Speed,
            FuelLevel = 0,
            Timestamp = request.Timestamp,
            TenantId = machine.TenantId,
        };

        _context.GpsTracks.Add(track);
        await _context.SaveChangesAsync(cancellationToken);

        var update = new FleetPositionUpdate(
            VehicleId: machine.Id,
            Lat: request.Lat,
            Lng: request.Lng,
            Speed: (double)request.Speed,
            Fuel: 0,
            TimestampUtc: request.Timestamp
        );

        await _fleetHubService.BroadcastPositionAsync(machine.TenantId, update, cancellationToken);

        return track.Id;
    }
}
