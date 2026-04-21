using AgroPlatform.Application.Auth.DTOs;
using MediatR;

namespace AgroPlatform.Application.Auth.Commands.RefreshToken;

public record RefreshTokenCommand(string RefreshToken) : IRequest<AuthResponse>;
