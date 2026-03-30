using MediatR;

namespace AgroPlatform.Domain.Common;

public abstract record DomainEvent : INotification
{
    public DateTime OccurredOn { get; init; } = DateTime.UtcNow;
}
