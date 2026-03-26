using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.GrainStorage.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.GrainStorage.Queries.GetGrainStorages;

public class GetGrainStoragesHandler : IRequestHandler<GetGrainStoragesQuery, IReadOnlyList<GrainStorageDto>>
{
    private readonly IAppDbContext _context;

    public GetGrainStoragesHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<GrainStorageDto>> Handle(GetGrainStoragesQuery request, CancellationToken cancellationToken)
    {
        var query = _context.GrainStorages.AsQueryable();

        if (request.ActiveOnly.HasValue)
            query = query.Where(s => s.IsActive == request.ActiveOnly.Value);

        var items = await query
            .OrderBy(s => s.Name)
            .Select(s => new GrainStorageDto
            {
                Id = s.Id,
                Name = s.Name,
                Code = s.Code,
                Location = s.Location,
                StorageType = s.StorageType,
                CapacityTons = s.CapacityTons,
                IsActive = s.IsActive,
                Notes = s.Notes,
                BatchCount = s.GrainBatches.Count(b => !b.IsDeleted),
                TotalTons = s.GrainBatches.Where(b => !b.IsDeleted).Sum(b => b.QuantityTons),
            })
            .ToListAsync(cancellationToken);

        return items;
    }
}
