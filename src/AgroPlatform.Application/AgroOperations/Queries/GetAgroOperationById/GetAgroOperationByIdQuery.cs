using AgroPlatform.Application.AgroOperations.DTOs;
using MediatR;

namespace AgroPlatform.Application.AgroOperations.Queries.GetAgroOperationById;

public record GetAgroOperationByIdQuery(Guid Id) : IRequest<AgroOperationDetailDto?>;
