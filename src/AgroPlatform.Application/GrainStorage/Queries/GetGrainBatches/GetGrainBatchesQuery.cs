using AgroPlatform.Domain.Enums;
using MediatR;

namespace AgroPlatform.Application.GrainStorage.Queries.GetGrainBatches;

public record GetGrainBatchesQuery(
    Guid? StorageId,
    GrainOwnershipType? OwnershipType,
    int Page = 1,
    int PageSize = 20
) : IRequest<GetGrainBatchesResult>;
