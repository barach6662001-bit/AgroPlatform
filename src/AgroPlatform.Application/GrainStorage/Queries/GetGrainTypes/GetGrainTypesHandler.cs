using AgroPlatform.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.GrainStorage.Queries.GetGrainTypes;

public class GetGrainTypesHandler : IRequestHandler<GetGrainTypesQuery, IReadOnlyList<string>>
{
    private readonly IAppDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public GetGrainTypesHandler(IAppDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<IReadOnlyList<string>> Handle(GetGrainTypesQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _currentUser.TenantId;

        // IgnoreQueryFilters is required so that default grain types (TenantId = Guid.Empty)
        // are visible alongside the tenant's own custom types.
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
