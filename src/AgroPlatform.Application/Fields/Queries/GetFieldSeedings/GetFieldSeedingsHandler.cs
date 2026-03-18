using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Fields.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Fields.Queries.GetFieldSeedings;

public class GetFieldSeedingsHandler : IRequestHandler<GetFieldSeedingsQuery, List<FieldSeedingDto>>
{
    private readonly IAppDbContext _context;

    public GetFieldSeedingsHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<List<FieldSeedingDto>> Handle(GetFieldSeedingsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.FieldSeedings
            .Where(s => s.FieldId == request.FieldId);

        if (request.Year.HasValue)
            query = query.Where(s => s.Year == request.Year.Value);

        return await query
            .OrderByDescending(s => s.Year)
            .ThenByDescending(s => s.SeedingDate)
            .Select(s => new FieldSeedingDto
            {
                Id = s.Id,
                Year = s.Year,
                CropName = s.CropName,
                Variety = s.Variety,
                SeedingRateKgPerHa = s.SeedingRateKgPerHa,
                TotalSeedKg = s.TotalSeedKg,
                SeedingDate = s.SeedingDate,
                Notes = s.Notes,
            })
            .ToListAsync(cancellationToken);
    }
}
