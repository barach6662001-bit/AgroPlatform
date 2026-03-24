using MediatR;

namespace AgroPlatform.Application.Notifications.Commands.RegisterPushSubscription;

public record RegisterPushSubscriptionCommand(
    string Endpoint,
    string? P256dhKey,
    string? AuthKey,
    string? UserAgent) : IRequest<Guid>;
