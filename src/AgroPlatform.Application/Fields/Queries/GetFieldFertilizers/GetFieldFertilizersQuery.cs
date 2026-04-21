using AgroPlatform.Application.Fields.DTOs;
using MediatR;

namespace AgroPlatform.Application.Fields.Queries.GetFieldFertilizers;

public record GetFieldFertilizersQuery(Guid FieldId, int? Year) : IRequest<List<FieldFertilizerDto>>;
