using AgroPlatform.Application.Fields.DTOs;
using MediatR;

namespace AgroPlatform.Application.Fields.Queries.GetLeases;

public record GetLeasesQuery(Guid? FieldId) : IRequest<List<LandLeaseDto>>;
