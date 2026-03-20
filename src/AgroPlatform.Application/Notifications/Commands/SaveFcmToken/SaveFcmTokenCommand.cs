using MediatR;

namespace AgroPlatform.Application.Notifications.Commands.SaveFcmToken;

public record SaveFcmTokenCommand(string Token) : IRequest;
