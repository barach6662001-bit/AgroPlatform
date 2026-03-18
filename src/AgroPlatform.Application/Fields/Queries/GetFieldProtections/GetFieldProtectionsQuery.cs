using AgroPlatform.Application.Fields.DTOs;
using MediatR;

namespace AgroPlatform.Application.Fields.Queries.GetFieldProtections;

public record GetFieldProtectionsQuery(Guid FieldId, int? Year) : IRequest<List<FieldProtectionDto>>;
