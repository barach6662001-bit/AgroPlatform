using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Notifications.Commands.ClearNotifications;
using AgroPlatform.Application.Notifications.Commands.MarkNotificationRead;
using AgroPlatform.Application.Notifications.Queries.GetNotifications;
using AgroPlatform.Domain.Notifications;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.UnitTests.Notifications;

public class NotificationHandlerTests
{
    private static IAppDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<TestDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new TestDbContext(options);
    }

    private static Notification MakeNotification(bool isRead = false) => new()
    {
        Type = "info",
        Title = "Test",
        Body = "Test body",
        IsRead = isRead,
        CreatedAtUtc = DateTime.UtcNow,
    };

    // ── MarkNotificationRead ─────────────────────────────────────────────────

    [Fact]
    public async Task MarkNotificationRead_ExistingId_SetsIsRead()
    {
        var ctx = CreateContext();
        var notification = MakeNotification(isRead: false);
        ctx.Notifications.Add(notification);
        await ctx.SaveChangesAsync();

        var handler = new MarkNotificationReadHandler(ctx);
        await handler.Handle(new MarkNotificationReadCommand(notification.Id), CancellationToken.None);

        var updated = await ((TestDbContext)ctx).Notifications.FindAsync(notification.Id);
        updated!.IsRead.Should().BeTrue();
    }

    [Fact]
    public async Task MarkNotificationRead_AllFlag_MarksAllRead()
    {
        var ctx = CreateContext();
        ctx.Notifications.Add(MakeNotification(isRead: false));
        ctx.Notifications.Add(MakeNotification(isRead: false));
        ctx.Notifications.Add(MakeNotification(isRead: true));
        await ctx.SaveChangesAsync();

        var handler = new MarkNotificationReadHandler(ctx);
        await handler.Handle(new MarkNotificationReadCommand(null), CancellationToken.None);

        var unreadCount = await ((TestDbContext)ctx).Notifications.CountAsync(n => !n.IsRead);
        unreadCount.Should().Be(0);
    }

    // ── ClearNotifications ───────────────────────────────────────────────────

    [Fact]
    public async Task ClearNotifications_DeletesReadNotifications()
    {
        var ctx = CreateContext();
        ctx.Notifications.Add(MakeNotification(isRead: true));
        ctx.Notifications.Add(MakeNotification(isRead: true));
        ctx.Notifications.Add(MakeNotification(isRead: false));
        await ctx.SaveChangesAsync();

        var handler = new ClearNotificationsHandler(ctx);
        await handler.Handle(new ClearNotificationsCommand(), CancellationToken.None);

        var remaining = await ((TestDbContext)ctx).Notifications.CountAsync();
        remaining.Should().Be(1);
    }

    // ── GetNotifications ─────────────────────────────────────────────────────

    [Fact]
    public async Task GetNotifications_UnreadOnlyFilter_ReturnsOnlyUnread()
    {
        var ctx = CreateContext();
        ctx.Notifications.Add(MakeNotification(isRead: false));
        ctx.Notifications.Add(MakeNotification(isRead: false));
        ctx.Notifications.Add(MakeNotification(isRead: true));
        await ctx.SaveChangesAsync();

        var handler = new GetNotificationsHandler(ctx);
        var result = await handler.Handle(new GetNotificationsQuery(UnreadOnly: true), CancellationToken.None);

        result.Should().HaveCount(2);
        result.Should().AllSatisfy(n => n.IsRead.Should().BeFalse());
    }
}
