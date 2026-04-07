using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Extensions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Enums;
using AgroPlatform.Domain.Warehouses;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Warehouses.Commands.ReturnStock;

public class ReturnStockHandler : IRequestHandler<ReturnStockCommand, Guid>
{
    private readonly IAppDbContext _context;
    private readonly IDateTimeService _dateTime;
    private readonly IStockBalanceService _stockBalance;
    private readonly IUnitConversionService _unitConversion;

    public ReturnStockHandler(
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

    public async Task<Guid> Handle(ReturnStockCommand request, CancellationToken cancellationToken)
    {
        await using var tx = await _context.Database.BeginRepeatableReadTransactionIfSupportedAsync(cancellationToken);

        // Idempotency check
        if (!string.IsNullOrEmpty(request.ClientOperationId))
        {
            var existing = await _context.StockMoves
                .FirstOrDefaultAsync(m => m.ClientOperationId == request.ClientOperationId, cancellationToken);
            if (existing != null)
            {
                if (tx is not null) await tx.CommitAsync(cancellationToken);
                return existing.Id;
            }
        }

        var warehouse = await _context.Warehouses.FindAsync(new object[] { request.WarehouseId }, cancellationToken)
            ?? throw new NotFoundException(nameof(Warehouse), request.WarehouseId);

        warehouse.EnsureActive();

        var item = await _context.WarehouseItems.FindAsync(new object[] { request.ItemId }, cancellationToken)
            ?? throw new NotFoundException(nameof(WarehouseItem), request.ItemId);

        // Convert requested quantity to item base unit
        var quantityBase = await _unitConversion.ConvertAsync(
            request.Quantity, request.UnitCode, item.BaseUnit, cancellationToken);

        var move = new StockMove
        {
            WarehouseId = request.WarehouseId,
            ItemId = request.ItemId,
            BatchId = request.BatchId,
            MoveType = StockMoveType.Return,
            Quantity = request.Quantity,
            UnitCode = request.UnitCode,
            QuantityBase = quantityBase,
            Note = request.Note,
            ClientOperationId = request.ClientOperationId,
        };

        _context.StockMoves.Add(move);

        // Return increases stock (same as receipt)
        var balanceAfter = await _stockBalance.IncreaseBalance(
            request.WarehouseId, request.ItemId, request.BatchId, quantityBase, item.BaseUnit, cancellationToken);

        _context.StockLedgerEntries.Add(new StockLedgerEntry
        {
            WarehouseId = request.WarehouseId,
            ItemId = request.ItemId,
            BatchId = request.BatchId,
            StockMoveId = move.Id,
            DocumentRef = request.ClientOperationId,
            MoveType = StockMoveType.Return,
            Quantity = request.Quantity,
            UnitCode = request.UnitCode,
            QuantityBase = quantityBase,
            BaseUnit = item.BaseUnit,
            BalanceAfterBase = balanceAfter,
            Note = request.Note,
            CreatedAtUtc = _dateTime.UtcNow,
        });

        try
        {
            await _context.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            throw new ConflictException("A concurrent update was detected on the stock balance. Please retry the operation.");
        }

        if (tx is not null) await tx.CommitAsync(cancellationToken);

        return move.Id;
    }
}
