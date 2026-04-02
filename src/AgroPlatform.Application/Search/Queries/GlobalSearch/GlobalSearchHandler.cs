using AgroPlatform.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Search.Queries.GlobalSearch;

public class GlobalSearchHandler : IRequestHandler<GlobalSearchQuery, List<GlobalSearchResultDto>>
{
    private readonly IAppDbContext _context;
    private const int MaxResultsPerType = 5;

    public GlobalSearchHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<List<GlobalSearchResultDto>> Handle(GlobalSearchQuery request, CancellationToken cancellationToken)
    {
        var term = request.Term.Trim().ToLower();
        if (string.IsNullOrWhiteSpace(term) || term.Length < 2)
            return new List<GlobalSearchResultDto>();

        var results = new List<GlobalSearchResultDto>();

        var fields = await _context.Fields
            .Where(f => f.Name.ToLower().Contains(term))
            .Take(MaxResultsPerType)
            .Select(f => new GlobalSearchResultDto
            {
                Type = "field",
                Id = f.Id,
                Title = f.Name,
                Subtitle = f.AreaHectares > 0 ? $"{f.AreaHectares} га" : null,
                Url = $"/fields/{f.Id}"
            })
            .ToListAsync(cancellationToken);
        results.AddRange(fields);

        var warehouses = await _context.Warehouses
            .Where(w => w.Name.ToLower().Contains(term))
            .Take(MaxResultsPerType)
            .Select(w => new GlobalSearchResultDto
            {
                Type = "warehouse",
                Id = w.Id,
                Title = w.Name,
                Subtitle = w.Location,
                Url = $"/warehouses/{w.Id}/items"
            })
            .ToListAsync(cancellationToken);
        results.AddRange(warehouses);

        var machines = await _context.Machines
            .Where(m => m.Name.ToLower().Contains(term))
            .Take(MaxResultsPerType)
            .Select(m => new GlobalSearchResultDto
            {
                Type = "machine",
                Id = m.Id,
                Title = m.Name,
                Subtitle = m.InventoryNumber,
                Url = $"/machinery"
            })
            .ToListAsync(cancellationToken);
        results.AddRange(machines);

        var employees = await _context.Employees
            .Where(e => (e.FirstName + " " + e.LastName).ToLower().Contains(term))
            .Take(MaxResultsPerType)
            .Select(e => new GlobalSearchResultDto
            {
                Type = "employee",
                Id = e.Id,
                Title = e.FirstName + " " + e.LastName,
                Subtitle = e.Position,
                Url = $"/hr"
            })
            .ToListAsync(cancellationToken);
        results.AddRange(employees);

        var grainStorages = await _context.GrainStorages
            .Where(g => g.Name.ToLower().Contains(term))
            .Take(MaxResultsPerType)
            .Select(g => new GlobalSearchResultDto
            {
                Type = "grainStorage",
                Id = g.Id,
                Title = g.Name,
                Url = $"/grain"
            })
            .ToListAsync(cancellationToken);
        results.AddRange(grainStorages);

        var fuelTanks = await _context.FuelTanks
            .Where(f => f.Name.ToLower().Contains(term))
            .Take(MaxResultsPerType)
            .Select(f => new GlobalSearchResultDto
            {
                Type = "fuelTank",
                Id = f.Id,
                Title = f.Name,
                Url = $"/fuel"
            })
            .ToListAsync(cancellationToken);
        results.AddRange(fuelTanks);

        var sales = await _context.Sales
            .Where(s => s.BuyerName.ToLower().Contains(term))
            .Take(MaxResultsPerType)
            .Select(s => new GlobalSearchResultDto
            {
                Type = "sale",
                Id = s.Id,
                Title = s.BuyerName,
                Subtitle = s.TotalAmount > 0 ? $"{s.TotalAmount:N0} {s.Currency}" : null,
                Url = $"/sales"
            })
            .ToListAsync(cancellationToken);
        results.AddRange(sales);

        return results;
    }
}
