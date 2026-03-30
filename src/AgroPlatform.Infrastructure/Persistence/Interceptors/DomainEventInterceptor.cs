using AgroPlatform.Domain.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace AgroPlatform.Infrastructure.Persistence.Interceptors;

public class DomainEventInterceptor : SaveChangesInterceptor
{
    private readonly IPublisher _publisher;

    public DomainEventInterceptor(IPublisher publisher)
    {
        _publisher = publisher;
    }

    public override async ValueTask<int> SavedChangesAsync(
        SaveChangesCompletedEventData eventData,
        int result,
        CancellationToken cancellationToken = default)
    {
        if (eventData.Context is not null)
            await DispatchEventsAsync(eventData.Context, cancellationToken);

        return await base.SavedChangesAsync(eventData, result, cancellationToken);
    }

    private async Task DispatchEventsAsync(DbContext context, CancellationToken cancellationToken)
    {
        var entities = context.ChangeTracker
            .Entries<BaseEntity>()
            .Select(e => e.Entity)
            .Where(e => e.DomainEvents.Count > 0)
            .ToList();

        var events = entities.SelectMany(e => e.DomainEvents).ToList();

        foreach (var entity in entities)
            entity.ClearDomainEvents();

        foreach (var domainEvent in events)
            await _publisher.Publish(domainEvent, cancellationToken);
    }
}
