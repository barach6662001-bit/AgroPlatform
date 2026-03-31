using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Companies.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Companies.Queries.GetCompanyUsers;

public class GetCompanyUsersHandler : IRequestHandler<GetCompanyUsersQuery, List<CompanyUserDto>>
{
    private readonly IAppDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public GetCompanyUsersHandler(IAppDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<List<CompanyUserDto>> Handle(GetCompanyUsersQuery request, CancellationToken cancellationToken)
    {
        if (!_currentUser.IsSuperAdmin)
            throw new ForbiddenException("Only SuperAdmin can list company users.");

        var users = await _db.Users
            .IgnoreQueryFilters()
            .Where(u => u.TenantId == request.TenantId)
            .OrderBy(u => u.Email)
            .ToListAsync(cancellationToken);

        return users.Select(u => new CompanyUserDto(
            u.Id,
            u.Email ?? string.Empty,
            u.FirstName,
            u.LastName,
            u.Role.ToString(),
            u.IsActive,
            u.RequirePasswordChange)).ToList();
    }
}
