using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Economics.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Economics.Queries.GetBreakEven;

public class GetBreakEvenHandler : IRequestHandler<GetBreakEvenQuery, IReadOnlyList<BreakEvenDto>>
{
    private readonly IAppDbContext _context;

    public GetBreakEvenHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<BreakEvenDto>> Handle(GetBreakEvenQuery request, CancellationToken cancellationToken)
    {
        var year = request.Year ?? DateTime.UtcNow.Year;
        var yearStart = new DateTime(year, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        var yearEnd   = new DateTime(year, 12, 31, 23, 59, 59, DateTimeKind.Utc);

        // Load all non-deleted fields (tenant filter applied via global query filter in AppDbContext)
        var fields = await _context.Fields
            .Where(f => !f.IsDeleted)
            .OrderBy(f => f.Name)
            .ToListAsync(cancellationToken);

        if (fields.Count == 0)
            return Array.Empty<BreakEvenDto>();

        var fieldIds = fields.Select(f => f.Id).ToList();

        // Sum only positive-amount cost records (negative amounts are revenue entries)
        var costTotals = await _context.CostRecords
            .Where(c => !c.IsDeleted
                        && c.FieldId.HasValue
                        && fieldIds.Contains(c.FieldId!.Value)
                        && c.Amount > 0
                        && c.Date >= yearStart
                        && c.Date <= yearEnd)
            .GroupBy(c => c.FieldId!.Value)
            .Select(g => new { FieldId = g.Key, TotalCosts = g.Sum(c => c.Amount) })
            .ToListAsync(cancellationToken);

        var costMap = costTotals.ToDictionary(c => c.FieldId, c => c.TotalCosts);

        var result = new List<BreakEvenDto>(fields.Count);

        foreach (var field in fields)
        {
            var totalCosts = costMap.TryGetValue(field.Id, out var costs) ? costs : 0m;

            decimal? breakEvenYield = null;
            if (field.AreaHectares > 0 && request.PricePerTonne > 0)
                breakEvenYield = Math.Round(totalCosts / (request.PricePerTonne * field.AreaHectares), 3);

            result.Add(new BreakEvenDto
            {
                FieldId = field.Id,
                FieldName = field.Name,
                AreaHectares = field.AreaHectares,
                CurrentCrop = field.CurrentCrop?.ToString(),
                TotalCosts = totalCosts,
                PricePerTonne = request.PricePerTonne,
                BreakEvenYield = breakEvenYield,
            });
        }

        return result;
    }
}
