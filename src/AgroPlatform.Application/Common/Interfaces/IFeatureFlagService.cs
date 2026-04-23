namespace AgroPlatform.Application.Common.Interfaces;

public interface IFeatureFlagService
{
    Task<bool> IsEnabledAsync(string key, CancellationToken cancellationToken = default);
    Task<IReadOnlyDictionary<string, bool>> GetCurrentTenantFeaturesAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyDictionary<string, bool>> GetFeaturesForTenantAsync(Guid tenantId, CancellationToken cancellationToken = default);
    void InvalidateTenant(Guid tenantId);
}