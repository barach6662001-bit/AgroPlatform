using MediatR;

namespace AgroPlatform.Application.GrainStorage.Queries.GetGrainMovements;

public record GetGrainMovementsQuery(Guid GrainBatchId) : IRequest<IReadOnlyList<GrainMovementDto>>;
