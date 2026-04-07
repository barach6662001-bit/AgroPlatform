using MediatR;

namespace AgroPlatform.Application.Auth.Commands.RevokeRefreshToken;

public record RevokeRefreshTokenCommand(string RefreshToken) : IRequest;
