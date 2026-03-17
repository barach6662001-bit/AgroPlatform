using AgroPlatform.Application.GrainStorage.DTOs;
using MediatR;

namespace AgroPlatform.Application.GrainStorage.Queries.GetGrainMovements;

public record GetGrainMovementsQuery(Guid BatchId) : IRequest<List<GrainMovementDto>>;
