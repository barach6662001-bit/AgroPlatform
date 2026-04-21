using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Companies.DTOs;
using AgroPlatform.Domain.Enums;
using AgroPlatform.Domain.Users;
using FluentValidation.Results;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Companies.Commands.CreateUser;

public class CreateUserHandler : IRequestHandler<CreateUserCommand, CompanyUserDto>
{
    private readonly UserManager<AppUser> _userManager;
    private readonly IAppDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public CreateUserHandler(UserManager<AppUser> userManager, IAppDbContext db, ICurrentUserService currentUser)
    {
        _userManager = userManager;
        _db = db;
        _currentUser = currentUser;
    }

    public async Task<CompanyUserDto> Handle(CreateUserCommand request, CancellationToken cancellationToken)
    {
        if (!_currentUser.IsSuperAdmin)
            throw new ForbiddenException("Only SuperAdmin can create users.");

        // Verify tenant exists
        var tenantExists = await _db.Tenants
            .IgnoreQueryFilters()
            .AnyAsync(t => t.Id == request.TenantId, cancellationToken);

        if (!tenantExists)
            throw new NotFoundException("Company", request.TenantId);

        if (!Enum.TryParse<UserRole>(request.Role, out var role) || role == UserRole.SuperAdmin)
            throw new ValidationException(new[] { new ValidationFailure("Role", "Invalid role. SuperAdmin cannot be assigned.") });

        var user = new AppUser
        {
            UserName              = request.Email,
            Email                 = request.Email,
            FirstName             = request.FirstName,
            LastName              = request.LastName,
            Role                  = role,
            TenantId              = request.TenantId,
            IsActive              = true,
            RequirePasswordChange = true,
            CreatedByUserId       = _currentUser.UserId,
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            var errors = result.Errors
                .Select(e => new ValidationFailure("Email", e.Description))
                .ToList();
            throw new ValidationException(errors);
        }

        return new CompanyUserDto(
            user.Id, user.Email!, user.FirstName, user.LastName,
            user.Role.ToString(), user.IsActive, user.RequirePasswordChange);
    }
}
