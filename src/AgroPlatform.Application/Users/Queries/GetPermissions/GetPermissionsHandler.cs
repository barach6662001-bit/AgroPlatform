using AgroPlatform.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Users.Queries.GetPermissions;

public class GetPermissionsHandler : IRequestHandler<GetPermissionsQuery, List<PermissionDto>>
{
    private readonly IAppDbContext _context;

    public GetPermissionsHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<List<PermissionDto>> Handle(GetPermissionsQuery request, CancellationToken cancellationToken)
    {
        var permissions = await _context.Permissions
            .Where(p => p.RoleId == request.RoleId && !p.IsDeleted)
            .Select(p => new PermissionDto(
                p.Id,
                p.Module,
                p.CanRead,
                p.CanCreate,
                p.CanUpdate,
                p.CanDelete,
                p.LastReviewedAtUtc,
                p.Notes
            ))
            .ToListAsync(cancellationToken);

        return permissions;
    }
}
