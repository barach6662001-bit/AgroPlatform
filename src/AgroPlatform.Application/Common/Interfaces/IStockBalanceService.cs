namespace AgroPlatform.Application.Common.Interfaces;

public interface IStockBalanceService
{
    Task IncreaseBalance(Guid warehouseId, Guid itemId, Guid? batchId, decimal quantity, string baseUnit, CancellationToken cancellationToken);
    Task DecreaseBalance(Guid warehouseId, Guid itemId, Guid? batchId, decimal quantity, CancellationToken cancellationToken);
    Task SetBalance(Guid warehouseId, Guid itemId, Guid? batchId, decimal quantity, string baseUnit, CancellationToken cancellationToken);
}
