using MediatR;

namespace AgroPlatform.Application.Notifications.Queries.GetNotifications;

public record GetNotificationsQuery(bool UnreadOnly = false, int Page = 1, int PageSize = 30)
    : IRequest<List<NotificationDto>>;

public record NotificationDto(
    Guid Id,
    string Type,
    string Title,
    string Body,
    bool IsRead,
    DateTime CreatedAtUtc
);
