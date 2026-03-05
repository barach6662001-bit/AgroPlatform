using AgroPlatform.Application.Fields.DTOs;
using MediatR;

namespace AgroPlatform.Application.Fields.Queries.GetFieldById;

public record GetFieldByIdQuery(Guid Id) : IRequest<FieldDetailDto?>;
