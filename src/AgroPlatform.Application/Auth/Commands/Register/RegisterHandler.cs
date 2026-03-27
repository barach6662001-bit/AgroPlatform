using AgroPlatform.Application.Auth.DTOs;
using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Users;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace AgroPlatform.Application.Auth.Commands.Register;

public class RegisterHandler : IRequestHandler<RegisterCommand, AuthResponse>
{
    private readonly UserManager<AppUser> _userManager;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly ITenantService _tenantService;
    private readonly IAppDbContext _db;

    public RegisterHandler(UserManager<AppUser> userManager, IJwtTokenService jwtTokenService, ITenantService tenantService, IAppDbContext db)
    {
        _userManager = userManager;
        _jwtTokenService = jwtTokenService;
        _tenantService = tenantService;
        _db = db;
    }

    public async Task<AuthResponse> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        var existing = await _userManager.FindByEmailAsync(request.Email);
        if (existing != null)
            throw new ConflictException($"User with email '{request.Email}' already exists.");

        var tenantId = _tenantService.GetTenantId();
        if (tenantId == Guid.Empty)
        {
            var tenant = new Tenant { Name = request.Email };
            _db.Tenants.Add(tenant);
            await _db.SaveChangesAsync(cancellationToken);
            tenantId = tenant.Id;
        }

        var user = new AppUser
        {
            UserName = request.Email,
            Email = request.Email,
            FirstName = request.FirstName,
            LastName = request.LastName,
            Role = request.Role,
            TenantId = tenantId,
            IsActive = true
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            var errors = result.Errors.Select(e => e.Description);
            throw new Application.Common.Exceptions.ValidationException(
                new[] { new FluentValidation.Results.ValidationFailure("Password", string.Join("; ", errors)) });
        }

        var (token, expiresAt) = _jwtTokenService.GenerateToken(user);
        return new AuthResponse(token, user.Email!, user.Role.ToString(), expiresAt, tenantId, user.FirstName, user.LastName);
    }
}
