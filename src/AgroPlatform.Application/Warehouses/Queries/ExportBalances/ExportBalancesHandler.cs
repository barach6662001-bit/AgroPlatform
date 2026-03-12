using System.Text;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Economics.Queries.ExportCostRecords;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Warehouses.Queries.ExportBalances;

public class ExportBalancesHandler : IRequestHandler<ExportBalancesQuery, ExportResult>
{
    private readonly IAppDbContext _context;

    public ExportBalancesHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<ExportResult> Handle(ExportBalancesQuery request, CancellationToken cancellationToken)
    {
        var query = _context.StockBalances
            .Include(b => b.Warehouse)
            .Include(b => b.Item)
            .AsQueryable();

        if (request.WarehouseId.HasValue)
            query = query.Where(b => b.WarehouseId == request.WarehouseId.Value);

        var records = await query
            .OrderBy(b => b.Warehouse.Name)
            .ThenBy(b => b.Item.Name)
            .Select(b => new
            {
                Warehouse = b.Warehouse.Name,
                Item = b.Item.Name,
                Code = b.Item.Code,
                Balance = b.BalanceBase,
                Unit = b.BaseUnit,
                Updated = b.LastUpdatedUtc,
            })
            .ToListAsync(cancellationToken);

        var sb = new StringBuilder();
        sb.AppendLine("Warehouse,Item,Code,Balance,Unit,LastUpdated");
        foreach (var r in records)
        {
            sb.AppendLine($"{Escape(r.Warehouse)},{Escape(r.Item)},{Escape(r.Code)},{r.Balance},{r.Unit},{r.Updated:yyyy-MM-dd}");
        }

        var bytes = Encoding.UTF8.GetPreamble().Concat(Encoding.UTF8.GetBytes(sb.ToString())).ToArray();
        return new ExportResult(bytes, "text/csv", $"stock-balances-{DateTime.UtcNow:yyyyMMdd}.csv");
    }

    private static string Escape(string value) =>
        value.Contains(',') || value.Contains('"') ? $"\"{value.Replace("\"", "\"\"")}\"" : value;
}
