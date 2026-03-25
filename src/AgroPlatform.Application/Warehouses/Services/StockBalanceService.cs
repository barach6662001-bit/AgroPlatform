using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Warehouses;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Warehouses.Services;

public class StockBalanceService : IStockBalanceService
{
    private readonly IAppDbContext _context;
    private readonly IDateTimeService _dateTime;

    public StockBalanceService(IAppDbContext context, IDateTimeService dateTime)
    {
        _context = context;
        _dateTime = dateTime;
    }

    public async Task IncreaseBalance(Guid warehouseId, Guid itemId, Guid? batchId, decimal quantity, string baseUnit, CancellationToken cancellationToken)
    {
        var balance = await FindBalance(warehouseId, itemId, batchId, cancellationToken);

        if (balance == null)
        {
            balance = new StockBalance
            {
                WarehouseId = warehouseId,
                ItemId = itemId,
                BatchId = batchId,
                BalanceBase = quantity,
                BaseUnit = baseUnit,
                LastUpdatedUtc = _dateTime.UtcNow,
                RowVersion = NewRowVersionToken()
            };
            _context.StockBalances.Add(balance);
        }
        else
        {
            balance.BalanceBase += quantity;
            balance.LastUpdatedUtc = _dateTime.UtcNow;
            balance.RowVersion = NewRowVersionToken();
        }
    }

    public async Task DecreaseBalance(Guid warehouseId, Guid itemId, Guid? batchId, decimal quantity, CancellationToken cancellationToken)
    {
        var balance = await FindBalance(warehouseId, itemId, batchId, cancellationToken);

        if (balance == null || balance.BalanceBase < quantity)
            throw new InsufficientBalanceException(warehouseId, itemId, quantity, balance?.BalanceBase ?? 0m);

        balance.BalanceBase -= quantity;
        balance.LastUpdatedUtc = _dateTime.UtcNow;
        balance.RowVersion = NewRowVersionToken();
    }

    public async Task SetBalance(Guid warehouseId, Guid itemId, Guid? batchId, decimal quantity, string baseUnit, CancellationToken cancellationToken)
    {
        var balance = await FindBalance(warehouseId, itemId, batchId, cancellationToken);

        if (balance == null)
        {
            balance = new StockBalance
            {
                WarehouseId = warehouseId,
                ItemId = itemId,
                BatchId = batchId,
                BalanceBase = quantity,
                BaseUnit = baseUnit,
                LastUpdatedUtc = _dateTime.UtcNow,
                RowVersion = NewRowVersionToken()
            };
            _context.StockBalances.Add(balance);
        }
        else
        {
            balance.BalanceBase = quantity;
            balance.LastUpdatedUtc = _dateTime.UtcNow;
            balance.RowVersion = NewRowVersionToken();
        }
    }

    private Task<StockBalance?> FindBalance(Guid warehouseId, Guid itemId, Guid? batchId, CancellationToken cancellationToken)
        => _context.StockBalances
            .FirstOrDefaultAsync(b =>
                b.WarehouseId == warehouseId &&
                b.ItemId == itemId &&
                b.BatchId == batchId,
                cancellationToken);

    private static byte[] NewRowVersionToken() => Guid.NewGuid().ToByteArray();
}
