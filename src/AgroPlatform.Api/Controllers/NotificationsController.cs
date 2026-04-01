using AgroPlatform.Application.Notifications.Commands.ClearNotifications;
using AgroPlatform.Application.Notifications.Commands.MarkNotificationRead;
using AgroPlatform.Application.Notifications.Commands.RegisterMobilePushToken;
using AgroPlatform.Application.Notifications.Commands.RegisterPushSubscription;
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

    /// <summary>Registers a push subscription endpoint for the current tenant.</summary>
    [HttpPost("push-subscriptions")]
    public async Task<IActionResult> RegisterPushSubscription(
        [FromBody] RegisterPushSubscriptionRequest request,
        CancellationToken cancellationToken)
    {
        var id = await _sender.Send(
            new RegisterPushSubscriptionCommand(
                request.Endpoint,
                request.P256dhKey,
                request.AuthKey,
                request.UserAgent),
            cancellationToken);
        return CreatedAtAction(nameof(RegisterPushSubscription), new { id }, new { id });
    }

    /// <summary>Registers or updates a mobile push token (Expo) for the current user.</summary>
    [HttpPost("push-token")]
    public async Task<IActionResult> RegisterMobilePushToken(
        [FromBody] RegisterMobilePushTokenRequest request,
        CancellationToken cancellationToken)
    {
        var id = await _sender.Send(
            new RegisterMobilePushTokenCommand(request.Token, request.Platform),
            cancellationToken);
        return Ok(new { id });
    }
}

public record RegisterPushSubscriptionRequest(
    string Endpoint,
    string? P256dhKey,
    string? AuthKey,
    string? UserAgent);

public record RegisterMobilePushTokenRequest(
    string Token,
    string Platform);
