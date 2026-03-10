using AgroPlatform.Application.Machinery.DTOs;
using MediatR;

namespace AgroPlatform.Application.Machinery.Queries.GetGpsTrack;

public record GetGpsTrackQuery(Guid MachineId, DateTime From, DateTime To) : IRequest<List<GpsTrackDto>?>;
