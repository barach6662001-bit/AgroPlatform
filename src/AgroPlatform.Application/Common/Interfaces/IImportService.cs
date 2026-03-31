namespace AgroPlatform.Application.Common.Interfaces;

public interface IImportService
{
    Task<List<ImportRowDto>> ParseAsync(Stream stream, string fileName, CancellationToken cancellationToken = default);
}

public record ImportRowDto(
    string Name,
    string Code,
    string Category,
    string BaseUnit,
    string? Description,
    decimal? MinimumQuantity,
    decimal? PurchasePrice,
    int RowNumber,
    List<string> Errors
);
