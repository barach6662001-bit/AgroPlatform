using MediatR;

namespace AgroPlatform.Application.Fields.Queries.ExportVraMapCsv;

public record ExportVraMapCsvQuery(Guid Id) : IRequest<byte[]>;
