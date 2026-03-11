using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Users;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Users.Queries.GetUsers;

public class GetUsersHandler : IRequestHandler<GetUsersQuery, List<UserListDto>>
{
    private readonly UserManager<AppUser> _userManager;
    private readonly ICurrentUserService _currentUser;

    public GetUsersHandler(UserManager<AppUser> userManager, ICurrentUserService currentUser)
    {
        _userManager = userManager;
        _currentUser = currentUser;
    }

    public async Task<List<UserListDto>> Handle(GetUsersQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _currentUser.TenantId;

        var users = await _userManager.Users
            .Where(u => u.TenantId == tenantId)
            .OrderBy(u => u.LastName)
            .ThenBy(u => u.FirstName)
            .ToListAsync(cancellationToken);

        return users.Select(u => new UserListDto
        {
            Id = u.Id,
            Email = u.Email ?? string.Empty,
            FirstName = u.FirstName,
            LastName = u.LastName,
            Role = u.Role.ToString(),
            IsActive = u.IsActive,
        }).ToList();
    }
}
