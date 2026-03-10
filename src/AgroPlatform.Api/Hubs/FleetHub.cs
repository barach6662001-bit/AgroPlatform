using AgroPlatform.Application.Common.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;

namespace AgroPlatform.Api.Hubs;

/// <summary>
/// SignalR hub that streams real-time vehicle telemetry to authorised clients.
/// Endpoint: <c>/hubs/fleet</c>.
///
/// <para>
/// Clients are automatically scoped to their tenant group on connect, ensuring
/// that broadcasts from <see cref="IFleetHubService"/> are delivered only to
/// connections belonging to the same tenant.
/// </para>
///
/// <para>
/// <b>Client subscription example (JavaScript / @microsoft/signalr):</b>
/// <code>
/// import * as signalR from "@microsoft/signalr";
///
/// const connection = new signalR.HubConnectionBuilder()
///     .withUrl("/hubs/fleet", {
///         accessTokenFactory: () => jwtToken
///     })
///     .withAutomaticReconnect()
///     .build();
///
/// connection.on("ReceivePositionUpdate", (update) => {
///     console.log(update); // { vehicleId, lat, lng, speed, fuel, timestampUtc }
/// });
///
/// await connection.start();
/// </code>
/// </para>
/// </summary>
[Authorize]
public class FleetHub : Hub
{
    private readonly ILogger<FleetHub> _logger;

    /// <summary>
    /// SignalR method name used when pushing telemetry to clients.
    /// </summary>
    public const string ReceivePositionUpdate = "ReceivePositionUpdate";

    /// <summary>Returns the SignalR group name for a given tenant.</summary>
    public static string TenantGroup(Guid tenantId) => $"tenant-{tenantId}";

    public FleetHub(ILogger<FleetHub> logger)
    {
        _logger = logger;
    }

    /// <inheritdoc />
    public override async Task OnConnectedAsync()
    {
        var tenantId = GetTenantId();
        if (tenantId != Guid.Empty)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, TenantGroup(tenantId));
            _logger.LogInformation(
                "Fleet hub: client {ConnectionId} connected and joined group {Group}",
                Context.ConnectionId, TenantGroup(tenantId));
        }
        else
        {
            _logger.LogWarning(
                "Fleet hub: client {ConnectionId} connected without a valid TenantId claim",
                Context.ConnectionId);
        }

        await base.OnConnectedAsync();
    }

    /// <inheritdoc />
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var tenantId = GetTenantId();
        if (tenantId != Guid.Empty)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, TenantGroup(tenantId));
        }

        if (exception is not null)
        {
            _logger.LogWarning(exception,
                "Fleet hub: client {ConnectionId} disconnected with error",
                Context.ConnectionId);
        }
        else
        {
            _logger.LogInformation(
                "Fleet hub: client {ConnectionId} disconnected",
                Context.ConnectionId);
        }

        await base.OnDisconnectedAsync(exception);
    }

    private Guid GetTenantId()
    {
        var claim = Context.User?.FindFirst("TenantId")?.Value;
        return Guid.TryParse(claim, out var id) ? id : Guid.Empty;
    }
}
