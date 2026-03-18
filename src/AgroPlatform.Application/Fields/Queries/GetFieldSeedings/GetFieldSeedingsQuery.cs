using AgroPlatform.Application.Fields.DTOs;
using MediatR;

namespace AgroPlatform.Application.Fields.Queries.GetFieldSeedings;

public record GetFieldSeedingsQuery(Guid FieldId, int? Year) : IRequest<List<FieldSeedingDto>>;
