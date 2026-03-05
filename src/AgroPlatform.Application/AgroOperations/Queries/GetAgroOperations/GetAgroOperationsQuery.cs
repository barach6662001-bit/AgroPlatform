using AgroPlatform.Application.AgroOperations.DTOs;
using AgroPlatform.Domain.Enums;
using MediatR;

namespace AgroPlatform.Application.AgroOperations.Queries.GetAgroOperations;

public record GetAgroOperationsQuery(
    Guid? FieldId,
    AgroOperationType? OperationType,
    bool? IsCompleted,
    DateTime? DateFrom,
    DateTime? DateTo,
    int Page = 1,
    int PageSize = 20
) : IRequest<List<AgroOperationDto>>;
