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

        var types = await _context.GrainTypes
            .IgnoreQueryFilters()
            .Where(g => !g.IsDeleted && (g.TenantId == tenantId || g.IsDefault))
            .OrderBy(g => !g.IsDefault)
            .ThenBy(g => g.Name)
            .Select(g => g.Name)
            .Distinct()
            .ToListAsync(cancellationToken);

        return types;
    }
}
