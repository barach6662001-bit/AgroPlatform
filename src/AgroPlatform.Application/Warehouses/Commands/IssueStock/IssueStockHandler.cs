using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Extensions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Economics;
using AgroPlatform.Domain.Enums;
using AgroPlatform.Domain.Warehouses;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Warehouses.Commands.IssueStock;

public class IssueStockHandler : IRequestHandler<IssueStockCommand, Guid>
{
    private readonly IAppDbContext _context;
    private readonly IDateTimeService _dateTime;
    private readonly IStockBalanceService _stockBalance;
    private readonly IUnitConversionService _unitConversion;

    public IssueStockHandler(
        IAppDbContext context,
        IDateTimeService dateTime,
        IStockBalanceService stockBalance,
        IUnitConversionService unitConversion)
    {
        _context = context;
        _dateTime = dateTime;
        _stockBalance = stockBalance;
        _unitConversion = unitConversion;
    }

    public async Task<Guid> Handle(IssueStockCommand request, CancellationToken cancellationToken)
    {
        await using var tx = await _context.Database.BeginRepeatableReadTransactionIfSupportedAsync(cancellationToken);

        // Idempotency check
        if (!string.IsNullOrEmpty(request.ClientOperationId))
        {
            var existing = await _context.StockMoves
                .FirstOrDefaultAsync(m => m.ClientOperationId == request.ClientOperationId, cancellationToken);
            if (existing != null)
            {
                if (tx is not null)
                {
                    await tx.CommitAsync(cancellationToken);
                }

                return existing.Id;
            }
        }

        var warehouse = await _context.Warehouses.FindAsync(new object[] { request.WarehouseId }, cancellationToken)
            ?? throw new NotFoundException(nameof(Warehouse), request.WarehouseId);

        warehouse.EnsureActive();

        var item = await _context.WarehouseItems.FindAsync(new object[] { request.ItemId }, cancellationToken)
            ?? throw new NotFoundException(nameof(WarehouseItem), request.ItemId);

        // Convert requested quantity to item's base unit for balance accounting.
        var quantityBase = await _unitConversion.ConvertAsync(
            request.Quantity, request.UnitCode, item.BaseUnit, cancellationToken);

        var totalCost = item.PurchasePrice.HasValue
            ? item.PurchasePrice.Value * request.Quantity
            : (decimal?)null;

        var move = new StockMove
        {
            WarehouseId = request.WarehouseId,
            ItemId = request.ItemId,
            BatchId = request.BatchId,
            MoveType = StockMoveType.Issue,
            Quantity = request.Quantity,   // original requested quantity
            UnitCode = request.UnitCode,   // original requested unit
            QuantityBase = quantityBase,   // converted to item base unit
            Note = request.Note,
            ClientOperationId = request.ClientOperationId,
            TotalCost = totalCost
        };

        _context.StockMoves.Add(move);

        var balanceAfter = await _stockBalance.DecreaseBalance(request.WarehouseId, request.ItemId, request.BatchId, quantityBase, cancellationToken);

        _context.StockLedgerEntries.Add(new StockLedgerEntry
        {
            WarehouseId      = request.WarehouseId,
            ItemId           = request.ItemId,
            BatchId          = request.BatchId,
            StockMoveId      = move.Id,
            DocumentRef      = request.ClientOperationId,
            MoveType         = StockMoveType.Issue,
            Quantity         = request.Quantity,
            UnitCode         = request.UnitCode,
            QuantityBase     = -quantityBase,         // negative — stock out
            BaseUnit         = item.BaseUnit,
            BalanceAfterBase = balanceAfter,
            AgroOperationId  = request.AgroOperationId,
            FieldId          = request.FieldId,
            TotalCost        = move.TotalCost,
            Note             = request.Note,
            CreatedAtUtc     = _dateTime.UtcNow,
        });

        // Auto-create cost record for manual stock issue
        if (totalCost.HasValue && totalCost.Value > 0)
        {
            var costCategory = item.Category switch
            {
                "Fertilizers" => CostCategory.Fertilizer,
                "Seeds" => CostCategory.Seeds,
                "Pesticides" => CostCategory.Pesticide,
                "Fuel" => CostCategory.Fuel,
                _ => CostCategory.Other
            };

            _context.CostRecords.Add(new CostRecord
            {
                Category = costCategory,
                Amount = totalCost.Value,
                Currency = "UAH",
                Date = _dateTime.UtcNow,
                FieldId = request.FieldId,
                AgroOperationId = request.AgroOperationId,
                Description = $"{item.Name}: {request.Quantity:F2} {request.UnitCode} × {item.PurchasePrice:F2} UAH"
            });
        }

        try
        {
            await _context.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            throw new ConflictException("A concurrent update was detected on the stock balance. Please retry the operation.");
        }

        if (tx is not null)
        {
            await tx.CommitAsync(cancellationToken);
        }

        return move.Id;
    }
}
