using AgroPlatform.Application.Auth.DTOs;
using MediatR;

namespace AgroPlatform.Application.Auth.Commands.ChangePassword;

/// <summary>Changes the current user's password. Returns a new JWT token with RequirePasswordChange = false.</summary>
public record ChangePasswordCommand(
    string CurrentPassword,
    string NewPassword
) : IRequest<AuthResponse>;
