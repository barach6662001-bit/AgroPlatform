using AgroPlatform.Domain.Common;

namespace AgroPlatform.Domain.GrainStorage;

/// <summary>
/// Raised after a grain batch quantity changes (reduce, increase, or adjustment).
/// QuantityChange is negative for outgoing moves, positive for incoming.
/// </summary>
public record StockMovedEvent(Guid GrainBatchId, decimal QuantityChange) : DomainEvent;
