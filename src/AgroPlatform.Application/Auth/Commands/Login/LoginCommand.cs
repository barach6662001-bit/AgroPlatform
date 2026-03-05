using AgroPlatform.Application.Auth.DTOs;
using MediatR;

namespace AgroPlatform.Application.Auth.Commands.Login;

public record LoginCommand(
    string Email,
    string Password
) : IRequest<AuthResponse>;
