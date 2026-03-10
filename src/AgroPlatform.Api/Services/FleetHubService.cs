using AgroPlatform.Api.Hubs;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Fleet;
using Microsoft.AspNetCore.SignalR;

namespace AgroPlatform.Api.Services;

/// <summary>
/// Publishes fleet telemetry updates to connected SignalR clients via <see cref="FleetHub"/>.
/// Lives in the API project so it can reference <see cref="FleetHub"/> without creating a
/// circular dependency with the Infrastructure layer.
/// </summary>
public class FleetHubService : IFleetHubService
{
    private readonly IHubContext<FleetHub> _hubContext;
    private readonly ILogger<FleetHubService> _logger;

    public FleetHubService(IHubContext<FleetHub> hubContext, ILogger<FleetHubService> logger)
    {
        _hubContext = hubContext;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task BroadcastPositionAsync(
        Guid tenantId,
        FleetPositionUpdate update,
        CancellationToken cancellationToken = default)
    {
        if (tenantId == Guid.Empty)
        {
            _logger.LogWarning(
                "FleetHubService: broadcast skipped — tenantId is empty for vehicle {VehicleId}",
                update.VehicleId);
            return;
        }

        if (update.Lat is < -90 or > 90)
        {
            _logger.LogWarning(
                "FleetHubService: broadcast skipped — invalid latitude {Lat} for vehicle {VehicleId}",
                update.Lat, update.VehicleId);
            return;
        }

        if (update.Lng is < -180 or > 180)
        {
            _logger.LogWarning(
                "FleetHubService: broadcast skipped — invalid longitude {Lng} for vehicle {VehicleId}",
                update.Lng, update.VehicleId);
            return;
        }

        if (update.Speed < 0)
        {
            _logger.LogWarning(
                "FleetHubService: broadcast skipped — negative speed {Speed} for vehicle {VehicleId}",
                update.Speed, update.VehicleId);
            return;
        }

        if (update.Fuel < 0)
        {
            _logger.LogWarning(
                "FleetHubService: broadcast skipped — negative fuel {Fuel} for vehicle {VehicleId}",
                update.Fuel, update.VehicleId);
            return;
        }

        try
        {
            var group = FleetHub.TenantGroup(tenantId);
            await _hubContext.Clients
                .Group(group)
                .SendAsync(FleetHub.ReceivePositionUpdate, update, cancellationToken);

            _logger.LogDebug(
                "FleetHubService: broadcast sent for vehicle {VehicleId} to group {Group}",
                update.VehicleId, group);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "FleetHubService: failed to broadcast update for vehicle {VehicleId}",
                update.VehicleId);
        }
    }
}
