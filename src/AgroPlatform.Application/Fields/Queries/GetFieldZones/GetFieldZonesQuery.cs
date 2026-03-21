using AgroPlatform.Application.Fields.DTOs;
using MediatR;

namespace AgroPlatform.Application.Fields.Queries.GetFieldZones;

public record GetFieldZonesQuery(Guid FieldId) : IRequest<List<FieldZoneDto>>;
