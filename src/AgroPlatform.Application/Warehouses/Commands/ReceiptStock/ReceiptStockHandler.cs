using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Enums;
using AgroPlatform.Domain.Warehouses;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace AgroPlatform.Application.Warehouses.Commands.ReceiptStock;

public class ReceiptStockHandler : IRequestHandler<ReceiptStockCommand, Guid>
{
    private readonly IAppDbContext _context;
    private readonly IDateTimeService _dateTime;
    private readonly IStockBalanceService _stockBalance;

    public ReceiptStockHandler(IAppDbContext context, IDateTimeService dateTime, IStockBalanceService stockBalance)
    {
        _context = context;
        _dateTime = dateTime;
        _stockBalance = stockBalance;
    }

    public async Task<Guid> Handle(ReceiptStockCommand request, CancellationToken cancellationToken)
    {
        await using var tx = await _context.Database.BeginTransactionAsync(IsolationLevel.RepeatableRead, cancellationToken);

        // Idempotency check
        if (!string.IsNullOrEmpty(request.ClientOperationId))
        {
            var existing = await _context.StockMoves
                .FirstOrDefaultAsync(m => m.ClientOperationId == request.ClientOperationId, cancellationToken);
            if (existing != null)
            {
                await tx.CommitAsync(cancellationToken);
                return existing.Id;
            }
        }

        var warehouse = await _context.Warehouses.FindAsync(new object[] { request.WarehouseId }, cancellationToken)
            ?? throw new NotFoundException(nameof(Warehouse), request.WarehouseId);

        if (!warehouse.IsActive)
            throw new ConflictException($"Warehouse '{warehouse.Name}' is not active.");

        var item = await _context.WarehouseItems.FindAsync(new object[] { request.ItemId }, cancellationToken)
            ?? throw new NotFoundException(nameof(WarehouseItem), request.ItemId);

        // Update purchase price from latest receipt
        if (request.PricePerUnit.HasValue && request.PricePerUnit.Value > 0)
        {
            item.PurchasePrice = request.PricePerUnit.Value;
        }

        var move = new StockMove
        {
            WarehouseId = request.WarehouseId,
            ItemId = request.ItemId,
            BatchId = request.BatchId,
            MoveType = StockMoveType.Receipt,
            Quantity = request.Quantity,
            UnitCode = request.UnitCode,
            QuantityBase = request.Quantity,
            Note = request.Note,
            ClientOperationId = request.ClientOperationId,
            TotalCost = request.PricePerUnit.HasValue
                ? Math.Round(request.Quantity * request.PricePerUnit.Value, 2)
                : (decimal?)null,
        };

        _context.StockMoves.Add(move);

        await _stockBalance.IncreaseBalance(request.WarehouseId, request.ItemId, request.BatchId, request.Quantity, request.UnitCode, cancellationToken);

        await _context.SaveChangesAsync(cancellationToken);
        await tx.CommitAsync(cancellationToken);
        return move.Id;
    }
}
