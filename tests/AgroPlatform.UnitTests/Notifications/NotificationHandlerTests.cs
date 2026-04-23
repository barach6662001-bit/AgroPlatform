using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Notifications.Commands.MarkNotificationRead;
using AgroPlatform.Application.Notifications.Queries.GetNotifications;
using AgroPlatform.Domain.Enums;
using AgroPlatform.Domain.Notifications;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.UnitTests.Notifications;

public class NotificationHandlerTests
{
    private sealed class TestCurrentUserService : ICurrentUserService
    {
        public string? UserId => null;
        public string? UserName => null;
        public Guid TenantId { get; } = Guid.NewGuid();
        public UserRole? Role => null;
        public bool IsInRole(UserRole role) => false;
        public bool IsSuperAdmin => false;
        public bool MfaVerified => true;
    }

    private static IAppDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<TestDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new TestDbContext(options);
    }

    // ── GetNotificationsHandler ──────────────────────────────────────────────

    [Fact]
    public async Task GetNotifications_EmptyDatabase_ReturnsEmptyList()
    {
        var context = CreateDbContext();
        var handler = new GetNotificationsHandler(context);

        var result = await handler.Handle(new GetNotificationsQuery(), CancellationToken.None);

        result.Should().BeEmpty();
    }

    [Fact]
    public async Task GetNotifications_ReturnsCorrectDtos()
    {
        var context = CreateDbContext();
        var tenantId = Guid.NewGuid();
        context.Notifications.Add(new Notification
        {
            TenantId = tenantId,
            Type = "info",
            Title = "Test Title",
            Body = "Test body",
            IsRead = false,
            CreatedAtUtc = DateTime.UtcNow,
        });
        await context.SaveChangesAsync();

        var handler = new GetNotificationsHandler(context);
        var result = await handler.Handle(new GetNotificationsQuery(), CancellationToken.None);

        result.Should().HaveCount(1);
        result[0].Title.Should().Be("Test Title");
        result[0].Body.Should().Be("Test body");
        result[0].Type.Should().Be("info");
        result[0].IsRead.Should().BeFalse();
    }

    [Fact]
    public async Task GetNotifications_UnreadOnlyFilter_ReturnsOnlyUnread()
    {
        var context = CreateDbContext();
        var tenantId = Guid.NewGuid();
        context.Notifications.AddRange(
            new Notification { TenantId = tenantId, Type = "info", Title = "Unread", Body = "body", IsRead = false, CreatedAtUtc = DateTime.UtcNow },
            new Notification { TenantId = tenantId, Type = "info", Title = "Read", Body = "body", IsRead = true, CreatedAtUtc = DateTime.UtcNow }
        );
        await context.SaveChangesAsync();

        var handler = new GetNotificationsHandler(context);
        var result = await handler.Handle(new GetNotificationsQuery(UnreadOnly: true), CancellationToken.None);

        result.Should().HaveCount(1);
        result[0].Title.Should().Be("Unread");
        result[0].IsRead.Should().BeFalse();
    }

    [Fact]
    public async Task GetNotifications_PaginationWorks()
    {
        var context = CreateDbContext();
        var tenantId = Guid.NewGuid();
        for (var i = 0; i < 5; i++)
        {
            context.Notifications.Add(new Notification
            {
                TenantId = tenantId,
                Type = "info",
                Title = $"Notification {i}",
                Body = "body",
                IsRead = false,
                CreatedAtUtc = DateTime.UtcNow.AddMinutes(-i),
            });
        }
        await context.SaveChangesAsync();

        var handler = new GetNotificationsHandler(context);
        var page1 = await handler.Handle(new GetNotificationsQuery(Page: 1, PageSize: 2), CancellationToken.None);
        var page2 = await handler.Handle(new GetNotificationsQuery(Page: 2, PageSize: 2), CancellationToken.None);

        page1.Should().HaveCount(2);
        page2.Should().HaveCount(2);
        page1.Select(n => n.Id).Should().NotIntersectWith(page2.Select(n => n.Id));
    }

    // ── MarkNotificationReadHandler ──────────────────────────────────────────

    [Fact]
    public async Task MarkNotificationRead_SingleNotification_MarksItAsRead()
    {
        var context = CreateDbContext();
        var tenantId = Guid.NewGuid();
        var notification = new Notification
        {
            TenantId = tenantId,
            Type = "warning",
            Title = "Alert",
            Body = "Something happened",
            IsRead = false,
            CreatedAtUtc = DateTime.UtcNow,
        };
        context.Notifications.Add(notification);
        await context.SaveChangesAsync();

        var handler = new MarkNotificationReadHandler(context);
        await handler.Handle(new MarkNotificationReadCommand(notification.Id), CancellationToken.None);

        var updated = await ((TestDbContext)context).Notifications.FindAsync(notification.Id);
        updated!.IsRead.Should().BeTrue();
    }

    [Fact]
    public async Task MarkNotificationRead_NonExistentId_DoesNotThrow()
    {
        var context = CreateDbContext();
        var handler = new MarkNotificationReadHandler(context);

        var act = () => handler.Handle(new MarkNotificationReadCommand(Guid.NewGuid()), CancellationToken.None);

        await act.Should().NotThrowAsync();
    }
}
