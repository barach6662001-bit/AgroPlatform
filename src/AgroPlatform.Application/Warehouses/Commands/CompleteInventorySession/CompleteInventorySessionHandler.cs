using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Extensions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Enums;
using AgroPlatform.Domain.Warehouses;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Warehouses.Commands.CompleteInventorySession;

public class CompleteInventorySessionHandler : IRequestHandler<CompleteInventorySessionCommand>
{
    private readonly IAppDbContext _context;
    private readonly IDateTimeService _dateTime;
    private readonly IStockBalanceService _stockBalance;

    public CompleteInventorySessionHandler(
        IAppDbContext context,
        IDateTimeService dateTime,
        IStockBalanceService stockBalance)
    {
        _context = context;
        _dateTime = dateTime;
        _stockBalance = stockBalance;
    }

    public async Task Handle(CompleteInventorySessionCommand request, CancellationToken cancellationToken)
    {
        await using var tx = await _context.Database.BeginRepeatableReadTransactionIfSupportedAsync(cancellationToken);

        var session = await _context.InventorySessions
            .Include(s => s.Lines)
            .FirstOrDefaultAsync(s => s.Id == request.SessionId, cancellationToken)
            ?? throw new NotFoundException(nameof(InventorySession), request.SessionId);

        if (session.Status != InventorySessionStatus.Approved)
            throw new ConflictException("Only Approved sessions can be completed.");

        foreach (var line in session.Lines.Where(l => l.IsCountRecorded && l.ActualQuantityBase.HasValue))
        {
            var actual = line.ActualQuantityBase!.Value;
            var difference = actual - line.ExpectedQuantityBase;

            if (difference == 0) continue;

            var moveType = difference > 0 ? StockMoveType.InventoryPlus : StockMoveType.InventoryMinus;
            var adjustQty = Math.Abs(difference);

            var move = new StockMove
            {
                WarehouseId = session.WarehouseId,
                ItemId = line.ItemId,
                BatchId = line.BatchId,
                MoveType = moveType,
                Quantity = actual,
                UnitCode = line.BaseUnit,
                QuantityBase = adjustQty,
                Note = $"Inventory session {session.Id}: {line.Note}"
            };

            _context.StockMoves.Add(move);

            var balanceAfter = await _stockBalance.SetBalance(
                session.WarehouseId, line.ItemId, line.BatchId, actual, line.BaseUnit, cancellationToken);

            _context.StockLedgerEntries.Add(new StockLedgerEntry
            {
                WarehouseId = session.WarehouseId,
                ItemId = line.ItemId,
                BatchId = line.BatchId,
                StockMoveId = move.Id,
                MoveType = moveType,
                Quantity = actual,
                UnitCode = line.BaseUnit,
                QuantityBase = difference,
                BaseUnit = line.BaseUnit,
                BalanceAfterBase = balanceAfter,
                CreatedAtUtc = _dateTime.UtcNow,
                Note = $"Inventory session {session.Id}"
            });
        }

        session.Status = InventorySessionStatus.Completed;
        session.CompletedAtUtc = _dateTime.UtcNow;

        try
        {
            await _context.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            throw new ConflictException("A concurrent update was detected. Please retry.");
        }

        if (tx is not null)
            await tx.CommitAsync(cancellationToken);
    }
}
