using System.Text;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Economics.Queries.ExportCostRecords;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Machinery.Queries.ExportMaintenanceRecords;

public class ExportMaintenanceRecordsHandler : IRequestHandler<ExportMaintenanceRecordsQuery, ExportResult>
{
    private readonly IAppDbContext _context;

    public ExportMaintenanceRecordsHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<ExportResult> Handle(ExportMaintenanceRecordsQuery request, CancellationToken cancellationToken)
    {
        var records = await _context.MaintenanceRecords
            .Where(m => m.MachineId == request.MachineId)
            .OrderByDescending(m => m.Date)
            .Select(m => new { m.Date, m.Type, m.Description, m.Cost, m.HoursAtMaintenance })
            .ToListAsync(cancellationToken);

        var sb = new StringBuilder();
        sb.AppendLine("Date,Type,Description,Cost,HoursAtMaintenance");
        foreach (var r in records)
        {
            sb.AppendLine($"{r.Date:yyyy-MM-dd},{Escape(r.Type)},{Escape(r.Description ?? "")},{r.Cost?.ToString() ?? ""},{r.HoursAtMaintenance?.ToString() ?? ""}");
        }

        var bytes = Encoding.UTF8.GetPreamble().Concat(Encoding.UTF8.GetBytes(sb.ToString())).ToArray();
        return new ExportResult(bytes, "text/csv", $"maintenance-{request.MachineId}-{DateTime.UtcNow:yyyyMMdd}.csv");
    }

    private static string Escape(string value) =>
        value.Contains(',') || value.Contains('"') ? $"\"{value.Replace("\"", "\"\"")}\"" : value;
}
