using AgroPlatform.Application.Common.Models;
using AgroPlatform.Application.Economics.DTOs;
using AgroPlatform.Domain.Enums;
using MediatR;

namespace AgroPlatform.Application.Economics.Queries.GetCostRecords;

public record GetCostRecordsQuery(
    CostCategory? Category,
    Guid? FieldId,
    Guid? AgroOperationId,
    DateTime? DateFrom,
    DateTime? DateTo,
    int Page = 1,
    int PageSize = 20
) : IRequest<PaginatedResult<CostRecordDto>>;
