using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Fields.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Fields.Queries.GetFieldFertilizers;

public class GetFieldFertilizersHandler : IRequestHandler<GetFieldFertilizersQuery, List<FieldFertilizerDto>>
{
    private readonly IAppDbContext _context;

    public GetFieldFertilizersHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<List<FieldFertilizerDto>> Handle(GetFieldFertilizersQuery request, CancellationToken cancellationToken)
    {
        var query = _context.FieldFertilizers
            .Where(f => f.FieldId == request.FieldId);

        if (request.Year.HasValue)
            query = query.Where(f => f.Year == request.Year.Value);

        return await query
            .OrderByDescending(f => f.Year)
            .ThenByDescending(f => f.ApplicationDate)
            .Select(f => new FieldFertilizerDto
            {
                Id = f.Id,
                Year = f.Year,
                FertilizerName = f.FertilizerName,
                ApplicationType = f.ApplicationType,
                RateKgPerHa = f.RateKgPerHa,
                TotalKg = f.TotalKg,
                CostPerKg = f.CostPerKg,
                TotalCost = f.TotalCost,
                ApplicationDate = f.ApplicationDate,
                Notes = f.Notes,
            })
            .ToListAsync(cancellationToken);
    }
}
