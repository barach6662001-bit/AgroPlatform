using AgroPlatform.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Admin.Queries.GetRolePermissions;

public class GetRolePermissionsHandler : IRequestHandler<GetRolePermissionsQuery, List<RolePermissionDto>>
{
    private readonly IAppDbContext _db;

    public GetRolePermissionsHandler(IAppDbContext db) => _db = db;

    public async Task<List<RolePermissionDto>> Handle(GetRolePermissionsQuery request, CancellationToken cancellationToken)
    {
        return await _db.RolePermissions
            .AsNoTracking()
            .OrderBy(r => r.RoleName)
            .ThenBy(r => r.PolicyName)
            .Select(r => new RolePermissionDto(r.RoleName, r.PolicyName, r.IsGranted))
            .ToListAsync(cancellationToken);
    }
}
