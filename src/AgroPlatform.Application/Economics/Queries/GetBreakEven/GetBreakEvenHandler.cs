using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Economics.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Economics.Queries.GetBreakEven;

public class GetBreakEvenHandler : IRequestHandler<GetBreakEvenQuery, IReadOnlyList<BreakEvenFieldDto>>
{
    private readonly IAppDbContext _context;

    public GetBreakEvenHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<BreakEvenFieldDto>> Handle(GetBreakEvenQuery request, CancellationToken cancellationToken)
    {
        var year = request.Year ?? DateTime.UtcNow.Year;
        var yearStart = new DateTime(year, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        var yearEnd   = new DateTime(year, 12, 31, 23, 59, 59, DateTimeKind.Utc);

        var fields = await _context.Fields
            .Where(f => !f.IsDeleted)
            .OrderBy(f => f.Name)
            .ToListAsync(cancellationToken);

        if (fields.Count == 0)
            return Array.Empty<BreakEvenFieldDto>();

        var fieldIds = fields.Select(f => f.Id).ToList();

        // Sum positive cost amounts per field for the year
        var costsByField = await _context.CostRecords
            .Where(c => !c.IsDeleted
                        && c.FieldId.HasValue
                        && fieldIds.Contains(c.FieldId!.Value)
                        && c.Amount > 0
                        && c.Date >= yearStart
                        && c.Date <= yearEnd)
            .GroupBy(c => c.FieldId!.Value)
            .Select(g => new { FieldId = g.Key, TotalCosts = g.Sum(c => c.Amount) })
            .ToListAsync(cancellationToken);

        var costsLookup = costsByField.ToDictionary(x => x.FieldId, x => x.TotalCosts);

        var result = fields.Select(field =>
        {
            var totalCosts = costsLookup.GetValueOrDefault(field.Id, 0m);
            decimal? minYield = null;
            if (field.AreaHectares > 0 && totalCosts > 0)
                minYield = Math.Round(totalCosts / (request.PricePerTonne * field.AreaHectares), 3);

            return new BreakEvenFieldDto
            {
                FieldId = field.Id,
                FieldName = field.Name,
                AreaHectares = field.AreaHectares,
                CurrentCrop = field.CurrentCrop?.ToString(),
                TotalCosts = totalCosts,
                MinYieldPerHectare = minYield,
            };
        }).ToList();

        return result;
    }
}
