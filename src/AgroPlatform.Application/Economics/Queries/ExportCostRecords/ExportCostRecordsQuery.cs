using AgroPlatform.Domain.Enums;
using MediatR;

namespace AgroPlatform.Application.Economics.Queries.ExportCostRecords;

public record ExportCostRecordsQuery(
    CostCategory? Category,
    DateTime? DateFrom,
    DateTime? DateTo
) : IRequest<ExportResult>;

public record ExportResult(byte[] Content, string ContentType, string FileName);
