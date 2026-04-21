using AgroPlatform.Application.Common.Interfaces;
using ClosedXML.Excel;
using CsvHelper;
using CsvHelper.Configuration;
using System.Globalization;

namespace AgroPlatform.Infrastructure.Services;

public class CsvXlsxImportService : IImportService
{
    public Task<List<ImportRowDto>> ParseAsync(Stream stream, string fileName, CancellationToken cancellationToken = default)
    {
        var ext = Path.GetExtension(fileName).ToLowerInvariant();
        return ext switch
        {
            ".csv" => Task.FromResult(ParseCsv(stream)),
            ".xlsx" => Task.FromResult(ParseXlsx(stream)),
            _ => throw new ArgumentException($"Unsupported file format: {ext}. Use .csv or .xlsx")
        };
    }

    private static List<ImportRowDto> ParseCsv(Stream stream)
    {
        using var reader = new StreamReader(stream);
        using var csv = new CsvReader(reader, new CsvConfiguration(CultureInfo.InvariantCulture)
        {
            HasHeaderRecord = true,
            MissingFieldFound = null,
            HeaderValidated = null,
        });

        csv.Read();
        csv.ReadHeader();

        var rows = new List<ImportRowDto>();
        var rowNum = 1;

        while (csv.Read())
        {
            rowNum++;
            var errors = new List<string>();

            var name = csv.GetField("Name") ?? csv.GetField("name") ?? "";
            var code = csv.GetField("Code") ?? csv.GetField("code") ?? "";
            var category = csv.GetField("Category") ?? csv.GetField("category") ?? "";
            var baseUnit = csv.GetField("BaseUnit") ?? csv.GetField("baseUnit") ?? csv.GetField("Unit") ?? "";

            if (string.IsNullOrWhiteSpace(name)) errors.Add("Name is required");
            if (string.IsNullOrWhiteSpace(code)) errors.Add("Code is required");
            if (string.IsNullOrWhiteSpace(baseUnit)) errors.Add("BaseUnit is required");

            var description = csv.GetField("Description") ?? csv.GetField("description");

            decimal? minQty = null;
            var minQtyStr = csv.GetField("MinimumQuantity") ?? csv.GetField("minimumQuantity");
            if (!string.IsNullOrWhiteSpace(minQtyStr))
            {
                if (decimal.TryParse(minQtyStr, NumberStyles.Any, CultureInfo.InvariantCulture, out var v))
                    minQty = v;
                else
                    errors.Add($"Invalid MinimumQuantity: {minQtyStr}");
            }

            decimal? price = null;
            var priceStr = csv.GetField("PurchasePrice") ?? csv.GetField("purchasePrice");
            if (!string.IsNullOrWhiteSpace(priceStr))
            {
                if (decimal.TryParse(priceStr, NumberStyles.Any, CultureInfo.InvariantCulture, out var v))
                    price = v;
                else
                    errors.Add($"Invalid PurchasePrice: {priceStr}");
            }

            rows.Add(new ImportRowDto(name, code, category ?? "", baseUnit, description, minQty, price, rowNum, errors));
        }

        return rows;
    }

    private static List<ImportRowDto> ParseXlsx(Stream stream)
    {
        using var workbook = new XLWorkbook(stream);
        var ws = workbook.Worksheet(1);
        var rows = new List<ImportRowDto>();

        var headerRow = ws.Row(1);
        var headers = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
        for (var col = 1; col <= ws.LastColumnUsed()?.ColumnNumber(); col++)
        {
            var h = headerRow.Cell(col).GetString().Trim();
            if (!string.IsNullOrEmpty(h)) headers[h] = col;
        }

        int Col(params string[] names)
        {
            foreach (var n in names)
                if (headers.TryGetValue(n, out var c)) return c;
            return -1;
        }

        var nameCol = Col("Name", "name");
        var codeCol = Col("Code", "code");
        var categoryCol = Col("Category", "category");
        var unitCol = Col("BaseUnit", "baseUnit", "Unit", "unit");
        var descCol = Col("Description", "description");
        var minQtyCol = Col("MinimumQuantity", "minimumQuantity");
        var priceCol = Col("PurchasePrice", "purchasePrice");

        for (var r = 2; r <= ws.LastRowUsed()?.RowNumber(); r++)
        {
            var row = ws.Row(r);
            if (row.IsEmpty()) continue;

            var errors = new List<string>();

            var name = nameCol > 0 ? row.Cell(nameCol).GetString().Trim() : "";
            var code = codeCol > 0 ? row.Cell(codeCol).GetString().Trim() : "";
            var category = categoryCol > 0 ? row.Cell(categoryCol).GetString().Trim() : "";
            var baseUnit = unitCol > 0 ? row.Cell(unitCol).GetString().Trim() : "";
            var description = descCol > 0 ? row.Cell(descCol).GetString().Trim() : null;

            if (string.IsNullOrWhiteSpace(name)) errors.Add("Name is required");
            if (string.IsNullOrWhiteSpace(code)) errors.Add("Code is required");
            if (string.IsNullOrWhiteSpace(baseUnit)) errors.Add("BaseUnit is required");

            decimal? minQty = null;
            if (minQtyCol > 0)
            {
                var cell = row.Cell(minQtyCol);
                if (!cell.IsEmpty())
                {
                    if (cell.TryGetValue<decimal>(out var v)) minQty = v;
                    else errors.Add($"Invalid MinimumQuantity: {cell.GetString()}");
                }
            }

            decimal? price = null;
            if (priceCol > 0)
            {
                var cell = row.Cell(priceCol);
                if (!cell.IsEmpty())
                {
                    if (cell.TryGetValue<decimal>(out var v)) price = v;
                    else errors.Add($"Invalid PurchasePrice: {cell.GetString()}");
                }
            }

            rows.Add(new ImportRowDto(name, code, category, baseUnit,
                string.IsNullOrWhiteSpace(description) ? null : description,
                minQty, price, r, errors));
        }

        return rows;
    }
}
