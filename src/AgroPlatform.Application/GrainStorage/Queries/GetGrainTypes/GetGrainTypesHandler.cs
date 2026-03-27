using AgroPlatform.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.GrainStorage.Queries.GetGrainTypes;

public class GetGrainTypesHandler : IRequestHandler<GetGrainTypesQuery, IReadOnlyList<string>>
{
    private readonly IAppDbContext _context;
    private readonly ITenantService _tenantService;

    public GetGrainTypesHandler(IAppDbContext context, ITenantService tenantService)
    {
        _context = context;
        _tenantService = tenantService;
    }

    public async Task<IReadOnlyList<string>> Handle(GetGrainTypesQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetTenantId();

        // Include default grain types (TenantId = Guid.Empty, IsDefault = true) alongside tenant-specific types
        var types = await _context.GrainTypes
            .IgnoreQueryFilters()
            .Where(g => !g.IsDeleted && (g.IsDefault || g.TenantId == tenantId))
            .OrderBy(g => !g.IsDefault)
            .ThenBy(g => g.Name)
            .Select(g => g.Name)
            .Distinct()
            .ToListAsync(cancellationToken);

        return types;
    }
}
