using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Enums;
using AgroPlatform.Domain.Warehouses;
using MediatR;

namespace AgroPlatform.Application.Warehouses.Commands.ReceiptStock;

public class ReceiptStockHandler : IRequestHandler<ReceiptStockCommand, Guid>
{
    private readonly IAppDbContext _context;
    private readonly IDateTimeService _dateTime;

    public ReceiptStockHandler(IAppDbContext context, IDateTimeService dateTime)
    {
        _context = context;
        _dateTime = dateTime;
    }

    public async Task<Guid> Handle(ReceiptStockCommand request, CancellationToken cancellationToken)
    {
        var warehouse = await _context.Warehouses.FindAsync(new object[] { request.WarehouseId }, cancellationToken)
            ?? throw new NotFoundException(nameof(Warehouse), request.WarehouseId);

        var item = await _context.WarehouseItems.FindAsync(new object[] { request.ItemId }, cancellationToken)
            ?? throw new NotFoundException(nameof(WarehouseItem), request.ItemId);

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
            ClientOperationId = request.ClientOperationId
        };

        _context.StockMoves.Add(move);
        await _context.SaveChangesAsync(cancellationToken);
        return move.Id;
    }
}
