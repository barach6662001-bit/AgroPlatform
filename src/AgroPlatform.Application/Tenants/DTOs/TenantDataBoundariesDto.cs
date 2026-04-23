namespace AgroPlatform.Application.Tenants.DTOs;

/// <summary>
/// The earliest and latest operational dates for the current tenant.
/// Used by the dashboard to disable the ‹ › period-stepping arrows when
/// the user would step past the range of data they actually have.
/// </summary>
/// <remarks>
/// Boundaries are derived from AgroOperations (planned / completed),
/// CostRecords and Sales combined. If the tenant has no data at all,
/// both values are <c>null</c>.
/// </remarks>
public sealed class TenantDataBoundariesDto
{
    public DateTime? MinOperationDate { get; init; }
    public DateTime? MaxOperationDate { get; init; }
}
