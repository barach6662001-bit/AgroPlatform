using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Fields.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Fields.Queries.GetFieldHarvests;

public class GetFieldHarvestsHandler : IRequestHandler<GetFieldHarvestsQuery, List<FieldHarvestDto>>
{
    private readonly IAppDbContext _context;

    public GetFieldHarvestsHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<List<FieldHarvestDto>> Handle(GetFieldHarvestsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.FieldHarvests
            .Where(h => h.FieldId == request.FieldId);

        if (request.Year.HasValue)
            query = query.Where(h => h.Year == request.Year.Value);

        return await query
            .OrderByDescending(h => h.Year)
            .ThenByDescending(h => h.HarvestDate)
            .Select(h => new FieldHarvestDto
            {
                Id = h.Id,
                Year = h.Year,
                CropName = h.CropName,
                TotalTons = h.TotalTons,
                YieldTonsPerHa = h.YieldTonsPerHa,
                MoisturePercent = h.MoisturePercent,
                PricePerTon = h.PricePerTon,
                TotalRevenue = h.TotalRevenue,
                HarvestDate = h.HarvestDate,
                Notes = h.Notes,
                SyncedFromGrainStorage = h.SyncedFromGrainStorage,
                GrainBatchId = h.GrainBatchId,
            })
            .ToListAsync(cancellationToken);
    }
}
