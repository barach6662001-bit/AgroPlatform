using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Machinery.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Machinery.Queries.GetGpsTrack;

public class GetGpsTrackHandler : IRequestHandler<GetGpsTrackQuery, List<GpsTrackDto>?>
{
    private readonly IAppDbContext _context;

    public GetGpsTrackHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<List<GpsTrackDto>?> Handle(GetGpsTrackQuery request, CancellationToken cancellationToken)
    {
        var machineExists = await _context.Machines
            .AnyAsync(m => m.Id == request.MachineId, cancellationToken);

        if (!machineExists)
            return null;

        return await _context.GpsTracks
            .Where(g => g.VehicleId == request.MachineId
                        && g.Timestamp >= request.From
                        && g.Timestamp <= request.To)
            .OrderBy(g => g.Timestamp)
            .Select(g => new GpsTrackDto
            {
                Id = g.Id,
                VehicleId = g.VehicleId,
                Lat = g.Lat,
                Lng = g.Lng,
                Speed = g.Speed,
                FuelLevel = g.FuelLevel,
                Timestamp = g.Timestamp
            })
            .ToListAsync(cancellationToken);
    }
}
