using MediatR;

namespace AgroPlatform.Application.Machinery.Commands.AddGpsTrack;

public record AddGpsTrackCommand(
    Guid MachineId,
    double Lat,
    double Lng,
    decimal Speed,
    decimal FuelLevel,
    DateTime Timestamp
) : IRequest<Guid>;
