using AgroPlatform.Application.Fields.DTOs;
using MediatR;

namespace AgroPlatform.Application.Fields.Queries.GetFieldInspections;

public record GetFieldInspectionsQuery(Guid FieldId) : IRequest<List<FieldInspectionDto>>;
