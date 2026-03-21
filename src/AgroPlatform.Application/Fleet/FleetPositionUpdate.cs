namespace AgroPlatform.Application.Fleet;

/// <summary>
/// Real-time telemetry payload broadcast over the <c>/hubs/fleet</c> SignalR hub.
/// </summary>
public record FleetPositionUpdate(
    /// <summary>Identifier of the vehicle (Machine.Id).</summary>
    Guid VehicleId,

    /// <summary>Latitude in decimal degrees (WGS-84). Must be in the range [-90, 90].</summary>
    double Lat,

    /// <summary>Longitude in decimal degrees (WGS-84). Must be in the range [-180, 180].</summary>
    double Lng,

    /// <summary>Ground speed in km/h. Non-negative.</summary>
    double Speed,

    /// <summary>Fuel level in litres. Non-negative.</summary>
    double Fuel,

    /// <summary>UTC timestamp of the telemetry reading.</summary>
    DateTime TimestampUtc,

    /// <summary>Human-readable name of the machine (e.g. "Трактор ХТЗ-17221").</summary>
    string MachineName = "",

    /// <summary>Machinery type string matching <c>MachineryType</c> enum name (e.g. "Tractor", "Combine").</summary>
    string MachineType = ""
);
