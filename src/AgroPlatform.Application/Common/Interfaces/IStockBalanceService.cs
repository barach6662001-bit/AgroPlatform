namespace AgroPlatform.Application.Common.Interfaces;

public interface IStockBalanceService
{
    /// <summary>Increases the stock balance and returns the new BalanceBase in base unit.</summary>
    Task<decimal> IncreaseBalance(Guid warehouseId, Guid itemId, Guid? batchId, decimal quantity, string baseUnit, CancellationToken cancellationToken);

    /// <summary>Decreases the stock balance and returns the new BalanceBase in base unit. Throws InsufficientBalanceException if balance would go negative.</summary>
    Task<decimal> DecreaseBalance(Guid warehouseId, Guid itemId, Guid? batchId, decimal quantity, CancellationToken cancellationToken);

    /// <summary>Sets the stock balance to the exact quantity and returns the new BalanceBase in base unit.</summary>
    Task<decimal> SetBalance(Guid warehouseId, Guid itemId, Guid? batchId, decimal quantity, string baseUnit, CancellationToken cancellationToken);
}
