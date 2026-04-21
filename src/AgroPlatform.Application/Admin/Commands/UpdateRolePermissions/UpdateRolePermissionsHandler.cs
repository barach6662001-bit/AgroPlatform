using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Authorization;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace AgroPlatform.Application.Admin.Commands.UpdateRolePermissions;

public class UpdateRolePermissionsHandler : IRequestHandler<UpdateRolePermissionsCommand>
{
    private readonly IAppDbContext _db;
    private readonly IMemoryCache _cache;

    public UpdateRolePermissionsHandler(IAppDbContext db, IMemoryCache cache)
    {
        _db = db;
        _cache = cache;
    }

    public async Task Handle(UpdateRolePermissionsCommand request, CancellationToken cancellationToken)
    {
        var rolesToInvalidate = new HashSet<string>(StringComparer.Ordinal);

        foreach (var item in request.Items)
        {
            rolesToInvalidate.Add(item.RoleName);

            var existing = await _db.RolePermissions
                .FirstOrDefaultAsync(r => r.RoleName == item.RoleName && r.PolicyName == item.PolicyName, cancellationToken);

            if (existing is not null)
            {
                existing.IsGranted = item.IsGranted;
            }
            else
            {
                _db.RolePermissions.Add(new RolePermission
                {
                    RoleName = item.RoleName,
                    PolicyName = item.PolicyName,
                    IsGranted = item.IsGranted,
                });
            }
        }

        await _db.SaveChangesAsync(cancellationToken);

        // Invalidate RBAC cache for affected roles
        foreach (var role in rolesToInvalidate)
        {
            _cache.Remove($"rbac:{role}");
        }
    }
}
