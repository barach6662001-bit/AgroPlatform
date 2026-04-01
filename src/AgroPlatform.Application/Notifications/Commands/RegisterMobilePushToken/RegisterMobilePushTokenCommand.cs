using MediatR;

namespace AgroPlatform.Application.Notifications.Commands.RegisterMobilePushToken;

public record RegisterMobilePushTokenCommand(
    string Token,
    string Platform) : IRequest<Guid>;
