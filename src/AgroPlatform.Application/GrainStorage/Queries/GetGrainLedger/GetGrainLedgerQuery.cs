using AgroPlatform.Application.Common.Models;
using AgroPlatform.Application.GrainStorage.DTOs;
using MediatR;

namespace AgroPlatform.Application.GrainStorage.Queries.GetGrainLedger;

public record GetGrainLedgerQuery(
    Guid? StorageId = null,
    Guid? BatchId = null,
    string? MovementType = null,
    DateTime? DateFrom = null,
    DateTime? DateTo = null,
    int Page = 1,
    int PageSize = 50
) : IRequest<PaginatedResult<GrainMovementDto>>;
