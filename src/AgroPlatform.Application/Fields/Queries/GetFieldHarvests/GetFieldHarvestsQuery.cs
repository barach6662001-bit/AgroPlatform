using AgroPlatform.Application.Fields.DTOs;
using MediatR;

namespace AgroPlatform.Application.Fields.Queries.GetFieldHarvests;

public record GetFieldHarvestsQuery(Guid FieldId, int? Year) : IRequest<List<FieldHarvestDto>>;
