using AgroPlatform.Application.GrainStorage.DTOs;
using AgroPlatform.Application.Common.Models;
using AgroPlatform.Domain.Enums;
using MediatR;

namespace AgroPlatform.Application.GrainStorage.Queries.GetGrainBatches;

public record GetGrainBatchesQuery(
    Guid? StorageId = null,
    GrainOwnershipType? OwnershipType = null,
    int Page = 1,
    int PageSize = 20
) : IRequest<PaginatedResult<GrainBatchDto>>;
