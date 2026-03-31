using AgroPlatform.Application.Common.Interfaces;
using MediatR;

namespace AgroPlatform.Application.Warehouses.Commands.ImportItems;

public record ParseImportCommand(Stream Stream, string FileName) : IRequest<ParseImportResult>;

public record ParseImportResult(List<ImportRowDto> Rows, int ValidCount, int ErrorCount);

public class ParseImportHandler : IRequestHandler<ParseImportCommand, ParseImportResult>
{
    private readonly IImportService _importService;

    public ParseImportHandler(IImportService importService)
    {
        _importService = importService;
    }

    public async Task<ParseImportResult> Handle(ParseImportCommand request, CancellationToken cancellationToken)
    {
        var rows = await _importService.ParseAsync(request.Stream, request.FileName, cancellationToken);
        var valid = rows.Count(r => r.Errors.Count == 0);
        var errors = rows.Count - valid;
        return new ParseImportResult(rows, valid, errors);
    }
}
