using AgroPlatform.Application.Auth.DTOs;
using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Users;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace AgroPlatform.Application.Auth.Commands.Login;

public class LoginHandler : IRequestHandler<LoginCommand, AuthResponse>
{
    private readonly UserManager<AppUser> _userManager;
    private readonly IJwtTokenService _jwtTokenService;

    public LoginHandler(UserManager<AppUser> userManager, IJwtTokenService jwtTokenService)
    {
        _userManager = userManager;
        _jwtTokenService = jwtTokenService;
    }

    public async Task<AuthResponse> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
            throw new ForbiddenException("Invalid credentials.");

        var isPasswordValid = await _userManager.CheckPasswordAsync(user, request.Password);
        if (!isPasswordValid)
            throw new ForbiddenException("Invalid credentials.");

        var (token, expiresAt) = _jwtTokenService.GenerateToken(user);
        return new AuthResponse(token, user.Email!, user.Role.ToString(), expiresAt, user.TenantId);
    }
}
