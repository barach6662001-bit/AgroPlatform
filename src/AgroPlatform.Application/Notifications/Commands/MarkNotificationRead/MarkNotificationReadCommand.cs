using MediatR;

namespace AgroPlatform.Application.Notifications.Commands.MarkNotificationRead;

public record MarkNotificationReadCommand(Guid? Id) : IRequest;
