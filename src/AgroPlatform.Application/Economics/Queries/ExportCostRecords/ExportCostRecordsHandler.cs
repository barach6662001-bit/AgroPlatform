using System.Text;
using AgroPlatform.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Economics.Queries.ExportCostRecords;

public class ExportCostRecordsHandler : IRequestHandler<ExportCostRecordsQuery, ExportResult>
{
    private readonly IAppDbContext _context;

    public ExportCostRecordsHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<ExportResult> Handle(ExportCostRecordsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.CostRecords.AsQueryable();

        if (!string.IsNullOrEmpty(request.Category))
            query = query.Where(c => c.Category == request.Category);
        if (request.DateFrom.HasValue)
            query = query.Where(c => c.Date >= request.DateFrom.Value);
        if (request.DateTo.HasValue)
            query = query.Where(c => c.Date <= request.DateTo.Value);

        var records = await query
            .OrderByDescending(c => c.Date)
            .Select(c => new { c.Date, c.Category, c.Amount, c.Currency, c.Description })
            .ToListAsync(cancellationToken);

        var sb = new StringBuilder();
        sb.AppendLine("Date,Category,Amount,Currency,Description");
        foreach (var r in records)
        {
            sb.AppendLine($"{r.Date:yyyy-MM-dd},{Escape(r.Category)},{r.Amount},{r.Currency},{Escape(r.Description ?? "")}");
        }

        var bytes = Encoding.UTF8.GetPreamble().Concat(Encoding.UTF8.GetBytes(sb.ToString())).ToArray();
        return new ExportResult(bytes, "text/csv", $"cost-records-{DateTime.UtcNow:yyyyMMdd}.csv");
    }

    private static string Escape(string value) =>
        value.Contains(',') || value.Contains('"') ? $"\"{value.Replace("\"", "\"\"")}\"" : value;
}
