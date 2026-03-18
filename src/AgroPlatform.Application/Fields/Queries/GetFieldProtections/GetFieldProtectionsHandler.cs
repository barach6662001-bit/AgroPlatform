using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Fields.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Fields.Queries.GetFieldProtections;

public class GetFieldProtectionsHandler : IRequestHandler<GetFieldProtectionsQuery, List<FieldProtectionDto>>
{
    private readonly IAppDbContext _context;

    public GetFieldProtectionsHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<List<FieldProtectionDto>> Handle(GetFieldProtectionsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.FieldProtections
            .Where(p => p.FieldId == request.FieldId);

        if (request.Year.HasValue)
            query = query.Where(p => p.Year == request.Year.Value);

        return await query
            .OrderByDescending(p => p.Year)
            .ThenByDescending(p => p.ApplicationDate)
            .Select(p => new FieldProtectionDto
            {
                Id = p.Id,
                Year = p.Year,
                ProductName = p.ProductName,
                ProtectionType = p.ProtectionType,
                RateLPerHa = p.RateLPerHa,
                TotalLiters = p.TotalLiters,
                CostPerLiter = p.CostPerLiter,
                TotalCost = p.TotalCost,
                ApplicationDate = p.ApplicationDate,
                Notes = p.Notes,
            })
            .ToListAsync(cancellationToken);
    }
}
