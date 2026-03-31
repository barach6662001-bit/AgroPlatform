using System.Text.Json;
using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Extensions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Enums;
using AgroPlatform.Domain.Warehouses;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Warehouses.Commands.InventoryAdjust;

public class InventoryAdjustHandler : IRequestHandler<InventoryAdjustCommand, InventoryAdjustResultDto>
{
    private readonly IAppDbContext _context;
    private readonly IDateTimeService _dateTime;
    private readonly IStockBalanceService _stockBalance;
    private readonly IUnitConversionService _unitConversion;
    private readonly IApprovalService _approvalService;
    private readonly ICurrentUserService _currentUser;

    public InventoryAdjustHandler(
        IAppDbContext context,
        IDateTimeService dateTime,
        IStockBalanceService stockBalance,
        IUnitConversionService unitConversion,
        IApprovalService approvalService,
        ICurrentUserService currentUser)
    {
        _context = context;
        _dateTime = dateTime;
        _stockBalance = stockBalance;
        _unitConversion = unitConversion;
        _approvalService = approvalService;
        _currentUser = currentUser;
    }

    public async Task<InventoryAdjustResultDto> Handle(InventoryAdjustCommand request, CancellationToken cancellationToken)
    {
        // Check approval rules before proceeding
        var (requiresApproval, approvalRequestId) = await _approvalService.CheckAndCreateIfRequired(
            ApprovalActionType.InventoryAdjust,
            "WarehouseItem",
            request.ItemId,
            request.ActualQuantity,
            JsonSerializer.Serialize(request),
            _currentUser.UserId,
            cancellationToken);

        if (requiresApproval)
            throw new ApprovalRequiredException(approvalRequestId!.Value);

        await using var tx = await _context.Database.BeginRepeatableReadTransactionIfSupportedAsync(cancellationToken);

        var warehouse = await _context.Warehouses.FindAsync(new object[] { request.WarehouseId }, cancellationToken)
            ?? throw new NotFoundException(nameof(Warehouse), request.WarehouseId);

        if (!warehouse.IsActive)
            throw new ConflictException($"Warehouse '{warehouse.Name}' is not active.");

        var item = await _context.WarehouseItems.FindAsync(new object[] { request.ItemId }, cancellationToken)
            ?? throw new NotFoundException(nameof(WarehouseItem), request.ItemId);

        // Convert the stated actual quantity to the item's base unit for balance accounting.
        var actualBase = await _unitConversion.ConvertAsync(
            request.ActualQuantity, request.UnitCode, item.BaseUnit, cancellationToken);

        var currentBalance = await _context.StockBalances
            .FirstOrDefaultAsync(b =>
                b.WarehouseId == request.WarehouseId &&
                b.ItemId == request.ItemId &&
                b.BatchId == request.BatchId,
                cancellationToken);

        var currentQty = currentBalance?.BalanceBase ?? 0m;  // always in base unit
        var difference = actualBase - currentQty;

        Guid? moveId = null;

        if (difference != 0)
        {
            var moveType = difference > 0 ? StockMoveType.InventoryPlus : StockMoveType.InventoryMinus;
            var adjustQty = Math.Abs(difference);  // in base unit

            var move = new StockMove
            {
                WarehouseId = request.WarehouseId,
                ItemId = request.ItemId,
                BatchId = request.BatchId,
                MoveType = moveType,
                Quantity = request.ActualQuantity, // original stated count
                UnitCode = request.UnitCode,       // original stated unit
                QuantityBase = adjustQty,          // delta in base unit
                Note = request.Note,
                ClientOperationId = request.ClientOperationId
            };

            _context.StockMoves.Add(move);
            moveId = move.Id;
        }

        var balanceAfter = await _stockBalance.SetBalance(request.WarehouseId, request.ItemId, request.BatchId, actualBase, item.BaseUnit, cancellationToken);

        if (difference != 0)
        {
            // Write one signed ledger entry per adjustment (positive = inventory surplus, negative = shrinkage)
            var moveType = difference > 0 ? StockMoveType.InventoryPlus : StockMoveType.InventoryMinus;
            _context.StockLedgerEntries.Add(new StockLedgerEntry
            {
                WarehouseId      = request.WarehouseId,
                ItemId           = request.ItemId,
                BatchId          = request.BatchId,
                StockMoveId      = moveId,
                DocumentRef      = request.ClientOperationId,
                MoveType         = moveType,
                Quantity         = request.ActualQuantity,    // stated physical count
                UnitCode         = request.UnitCode,
                QuantityBase     = difference,                // signed delta in base unit
                BaseUnit         = item.BaseUnit,
                BalanceAfterBase = balanceAfter,
                Note             = request.Note,
                CreatedAtUtc     = _dateTime.UtcNow,
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

        return new InventoryAdjustResultDto
        {
            MoveId = moveId,
            AdjustmentAmount = difference
        };
    }
}
