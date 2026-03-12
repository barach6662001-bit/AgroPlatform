using System.Text;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Economics.Queries.ExportCostRecords;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Economics.Queries.ExportBudgets;

public class ExportBudgetsHandler : IRequestHandler<ExportBudgetsQuery, ExportResult>
{
    private readonly IAppDbContext _context;

    public ExportBudgetsHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<ExportResult> Handle(ExportBudgetsQuery request, CancellationToken cancellationToken)
    {
        var records = await _context.Budgets
            .Where(b => b.Year == request.Year)
            .OrderBy(b => b.Category)
            .Select(b => new { b.Year, b.Category, b.PlannedAmount, b.Note })
            .ToListAsync(cancellationToken);

        var sb = new StringBuilder();
        sb.AppendLine("Year,Category,PlannedAmount,Note");
        foreach (var r in records)
        {
            sb.AppendLine($"{r.Year},{Escape(r.Category)},{r.PlannedAmount},{Escape(r.Note ?? "")}");
        }

        var bytes = Encoding.UTF8.GetPreamble().Concat(Encoding.UTF8.GetBytes(sb.ToString())).ToArray();
        return new ExportResult(bytes, "text/csv", $"budgets-{request.Year}.csv");
    }

    private static string Escape(string value) =>
        value.Contains(',') || value.Contains('"') ? $"\"{value.Replace("\"", "\"\"")}\"" : value;
}
