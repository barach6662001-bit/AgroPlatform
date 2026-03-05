using AgroPlatform.Application.Economics.DTOs;
using MediatR;

namespace AgroPlatform.Application.Economics.Queries.GetCostRecords;

public record GetCostRecordsQuery(
    string? Category,
    Guid? FieldId,
    Guid? AgroOperationId,
    DateTime? DateFrom,
    DateTime? DateTo
) : IRequest<List<CostRecordDto>>;
