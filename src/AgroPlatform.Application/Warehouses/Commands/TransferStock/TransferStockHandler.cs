using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Enums;
using AgroPlatform.Domain.Warehouses;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Warehouses.Commands.TransferStock;

public class TransferStockHandler : IRequestHandler<TransferStockCommand, Guid>
{
    private readonly IAppDbContext _context;
    private readonly IDateTimeService _dateTime;
    private readonly IStockBalanceService _stockBalance;

    public TransferStockHandler(IAppDbContext context, IDateTimeService dateTime, IStockBalanceService stockBalance)
    {
        _context = context;
        _dateTime = dateTime;
        _stockBalance = stockBalance;
    }

    public async Task<Guid> Handle(TransferStockCommand request, CancellationToken cancellationToken)
    {
        if (request.SourceWarehouseId == request.DestinationWarehouseId)
            throw new ConflictException("Source and destination warehouses must be different.");

        // Idempotency check
        if (!string.IsNullOrEmpty(request.ClientOperationId))
        {
            var existing = await _context.StockMoves
                .FirstOrDefaultAsync(m => m.ClientOperationId == request.ClientOperationId, cancellationToken);
            if (existing != null)
                return existing.OperationId ?? existing.Id;
        }

        var sourceWarehouse = await _context.Warehouses.FindAsync(new object[] { request.SourceWarehouseId }, cancellationToken)
            ?? throw new NotFoundException(nameof(Warehouse), request.SourceWarehouseId);

        if (!sourceWarehouse.IsActive)
            throw new ConflictException($"Source warehouse '{sourceWarehouse.Name}' is not active.");

        var destWarehouse = await _context.Warehouses.FindAsync(new object[] { request.DestinationWarehouseId }, cancellationToken)
            ?? throw new NotFoundException(nameof(Warehouse), request.DestinationWarehouseId);

        if (!destWarehouse.IsActive)
            throw new ConflictException($"Destination warehouse '{destWarehouse.Name}' is not active.");

        _ = await _context.WarehouseItems.FindAsync(new object[] { request.ItemId }, cancellationToken)
            ?? throw new NotFoundException(nameof(WarehouseItem), request.ItemId);

        var operationId = Guid.NewGuid();

        var transferOut = new StockMove
        {
            WarehouseId = request.SourceWarehouseId,
            ItemId = request.ItemId,
            BatchId = request.BatchId,
            OperationId = operationId,
            MoveType = StockMoveType.TransferOut,
            Quantity = request.Quantity,
            UnitCode = request.UnitCode,
            QuantityBase = request.Quantity,
            Note = request.Note,
            ClientOperationId = request.ClientOperationId
        };

        var transferIn = new StockMove
        {
            WarehouseId = request.DestinationWarehouseId,
            ItemId = request.ItemId,
            BatchId = request.BatchId,
            OperationId = operationId,
            MoveType = StockMoveType.TransferIn,
            Quantity = request.Quantity,
            UnitCode = request.UnitCode,
            QuantityBase = request.Quantity,
            Note = request.Note
        };

        _context.StockMoves.Add(transferOut);
        _context.StockMoves.Add(transferIn);

        await _stockBalance.DecreaseBalance(request.SourceWarehouseId, request.ItemId, request.BatchId, request.Quantity, cancellationToken);
        await _stockBalance.IncreaseBalance(request.DestinationWarehouseId, request.ItemId, request.BatchId, request.Quantity, request.UnitCode, cancellationToken);

        await _context.SaveChangesAsync(cancellationToken);
        return operationId;
    }
}
