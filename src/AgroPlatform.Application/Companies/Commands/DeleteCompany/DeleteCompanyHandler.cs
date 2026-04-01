using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Users;
using FluentValidation.Results;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Companies.Commands.DeleteCompany;

public class DeleteCompanyHandler : IRequestHandler<DeleteCompanyCommand>
{
    private readonly IAppDbContext _db;
    private readonly UserManager<AppUser> _userManager;
    private readonly ICurrentUserService _currentUser;

    public DeleteCompanyHandler(IAppDbContext db, UserManager<AppUser> userManager, ICurrentUserService currentUser)
    {
        _db = db;
        _userManager = userManager;
        _currentUser = currentUser;
    }

    public async Task Handle(DeleteCompanyCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUser.IsSuperAdmin)
            throw new ForbiddenException("Only SuperAdmin can delete companies.");

        var tenant = await _db.Tenants
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(t => t.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException("Company", request.Id);

        var tenantUsers = _userManager.Users
            .Where(u => u.TenantId == request.Id)
            .ToList();

        var activeUsers = tenantUsers.Where(u => u.IsActive).ToList();
        if (activeUsers.Count > 0)
            throw new ValidationException(new[]
            {
                new ValidationFailure("Users",
                    "Cannot delete company with active users. Deactivate or delete all users first.")
            });

        foreach (var user in tenantUsers)
            await _userManager.DeleteAsync(user);

        _db.Tenants.Remove(tenant);
        await _db.SaveChangesAsync(cancellationToken);
    }
}
