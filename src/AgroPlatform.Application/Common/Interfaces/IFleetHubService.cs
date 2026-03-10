using AgroPlatform.Application.Fleet;

namespace AgroPlatform.Application.Common.Interfaces;

/// <summary>
/// Publishes real-time fleet telemetry updates to connected SignalR clients.
/// </summary>
public interface IFleetHubService
{
    /// <summary>
    /// Broadcasts a <see cref="FleetPositionUpdate"/> to all clients subscribed to the
    /// given tenant group.
    /// </summary>
    /// <param name="tenantId">Tenant whose connected clients should receive the update.</param>
    /// <param name="update">Telemetry payload to send.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    Task BroadcastPositionAsync(Guid tenantId, FleetPositionUpdate update, CancellationToken cancellationToken = default);
}
