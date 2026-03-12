using MediatR;

namespace AgroPlatform.Application.Economics.Queries.ExportCostRecords;

public record ExportCostRecordsQuery(
    string? Category,
    DateTime? DateFrom,
    DateTime? DateTo
) : IRequest<ExportResult>;

public record ExportResult(byte[] Content, string ContentType, string FileName);
