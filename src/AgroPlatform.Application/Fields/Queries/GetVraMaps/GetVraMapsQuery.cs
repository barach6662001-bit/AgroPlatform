using AgroPlatform.Application.Fields.DTOs;
using MediatR;

namespace AgroPlatform.Application.Fields.Queries.GetVraMaps;

public record GetVraMapsQuery(Guid FieldId, int? Year = null) : IRequest<IReadOnlyList<VraMapDto>>;
