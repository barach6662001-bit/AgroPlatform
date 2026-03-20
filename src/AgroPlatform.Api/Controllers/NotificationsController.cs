using AgroPlatform.Application.Notifications.Commands.ClearNotifications;
using AgroPlatform.Application.Notifications.Commands.MarkNotificationRead;
using AgroPlatform.Application.Notifications.Commands.SaveFcmToken;
using AgroPlatform.Application.Notifications.Queries.GetNotifications;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgroPlatform.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/notifications")]
[Produces("application/json")]
public class NotificationsController : ControllerBase
{
    private readonly ISender _sender;

    public NotificationsController(ISender sender)
    {
        _sender = sender;
    }

    /// <summary>Returns recent notifications for the current tenant.</summary>
    [HttpGet]
    public async Task<IActionResult> GetNotifications(
        [FromQuery] bool unreadOnly = false,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 30,
        CancellationToken cancellationToken = default)
    {
        var result = await _sender.Send(new GetNotificationsQuery(unreadOnly, page, pageSize), cancellationToken);
        return Ok(result);
    }

    /// <summary>Marks one or all notifications as read. Pass id to mark one; omit to mark all.</summary>
    [HttpPut("{id}/read")]
    public async Task<IActionResult> MarkRead(Guid id, CancellationToken cancellationToken)
    {
        await _sender.Send(new MarkNotificationReadCommand(id), cancellationToken);
        return NoContent();
    }

    /// <summary>Marks all notifications as read.</summary>
    [HttpPut("read-all")]
    public async Task<IActionResult> MarkAllRead(CancellationToken cancellationToken)
    {
        await _sender.Send(new MarkNotificationReadCommand(null), cancellationToken);
        return NoContent();
    }

    /// <summary>Deletes all read notifications.</summary>
    [HttpDelete]
    public async Task<IActionResult> ClearRead(CancellationToken cancellationToken)
    {
        await _sender.Send(new ClearNotificationsCommand(), cancellationToken);
        return NoContent();
    }

    /// <summary>Registers or updates the FCM push token for the current user.</summary>
    [HttpPut("fcm-token")]
    public async Task<IActionResult> SaveFcmToken([FromBody] SaveFcmTokenRequest request, CancellationToken cancellationToken)
    {
        await _sender.Send(new SaveFcmTokenCommand(request.Token), cancellationToken);
        return NoContent();
    }
}

public record SaveFcmTokenRequest(string Token);
