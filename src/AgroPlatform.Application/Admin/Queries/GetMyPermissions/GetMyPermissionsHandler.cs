using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Admin.Queries.GetMyPermissions;

public class GetMyPermissionsHandler : IRequestHandler<GetMyPermissionsQuery, MyPermissionsDto>
{
    private readonly ICurrentUserService _currentUser;
    private readonly IAppDbContext _db;

    public GetMyPermissionsHandler(ICurrentUserService currentUser, IAppDbContext db)
    {
        _currentUser = currentUser;
        _db = db;
    }

    public async Task<MyPermissionsDto> Handle(GetMyPermissionsQuery request, CancellationToken cancellationToken)
    {
        var role = _currentUser.Role;
        if (role is null)
            return new MyPermissionsDto(string.Empty, []);

        var roleName = role.Value.ToString();

        if (role is UserRole.SuperAdmin or UserRole.CompanyAdmin)
        {
            var allPolicies = await _db.RolePermissions
                .AsNoTracking()
                .Select(r => r.PolicyName)
                .Distinct()
                .ToListAsync(cancellationToken);
            return new MyPermissionsDto(roleName, allPolicies);
        }

        var permissions = await _db.RolePermissions
            .AsNoTracking()
            .Where(r => r.RoleName == roleName && r.IsGranted)
            .Select(r => r.PolicyName)
            .ToListAsync(cancellationToken);

        return new MyPermissionsDto(roleName, permissions);
    }
}
