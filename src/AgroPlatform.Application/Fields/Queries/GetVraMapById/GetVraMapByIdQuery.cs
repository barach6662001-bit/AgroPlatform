using AgroPlatform.Application.Fields.DTOs;
using MediatR;

namespace AgroPlatform.Application.Fields.Queries.GetVraMapById;

public record GetVraMapByIdQuery(Guid Id) : IRequest<VraMapDto?>;
