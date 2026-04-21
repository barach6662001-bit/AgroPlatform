using System.Text.Json;
using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Extensions;
using AgroPlatform.Application.Common.Helpers;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Economics;
using AgroPlatform.Domain.Enums;
using AgroPlatform.Domain.Warehouses;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Warehouses.Commands.IssueStock;

public class IssueStockHandler : IRequestHandler<IssueStockCommand, IssueStockResultDto>
{
    private readonly IAppDbContext _context;
    private readonly IDateTimeService _dateTime;
    private readonly IStockBalanceService _stockBalance;
    private readonly IUnitConversionService _unitConversion;
    private readonly IApprovalService _approvalService;
    private readonly ICurrentUserService _currentUser;

    public IssueStockHandler(
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

    public async Task<IssueStockResultDto> Handle(IssueStockCommand request, CancellationToken cancellationToken)
    {
        // Check approval rules before proceeding
        var (requiresApproval, approvalRequestId) = await _approvalService.CheckAndCreateIfRequired(
            ApprovalActionType.IssueStock,
            "WarehouseItem",
            request.ItemId,
            request.Quantity,
            JsonSerializer.Serialize(request),
            _currentUser.UserId,
            cancellationToken);

        if (requiresApproval)
            throw new ApprovalRequiredException(approvalRequestId!.Value);

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

                return new IssueStockResultDto(new List<IssuedBatchDto>
                {
                    new(existing.Id, existing.BatchId, null, existing.QuantityBase)
                });
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

        // ── Determine batch allocations ────────────────────────────────
        List<BatchAllocation> allocations;

        if (request.BatchId.HasValue)
        {
            // Explicit batch: single-batch issue (original behavior)
            allocations = new List<BatchAllocation>
            {
                new(request.BatchId, null, quantityBase)
            };
        }
        else
        {
            // Auto-select batches using FEFO/FIFO strategy
            allocations = await SelectBatchesFifoFefo(
                request.WarehouseId, request.ItemId, quantityBase, cancellationToken);
        }

        // ── Issue from each allocated batch ────────────────────────────
        var issuedBatches = new List<IssuedBatchDto>();

        foreach (var alloc in allocations)
        {
            var proportion = quantityBase > 0 ? alloc.QuantityBase / quantityBase : 0;
            var moveQuantityOriginal = request.Quantity * proportion;
            var moveTotalCost = item.PurchasePrice.HasValue
                ? item.PurchasePrice.Value * moveQuantityOriginal
                : (decimal?)null;

            var move = new StockMove
            {
                WarehouseId = request.WarehouseId,
                ItemId = request.ItemId,
                BatchId = alloc.BatchId,
                MoveType = StockMoveType.Issue,
                Quantity = moveQuantityOriginal,
                UnitCode = request.UnitCode,
                QuantityBase = alloc.QuantityBase,
                Note = request.Note,
                ClientOperationId = request.ClientOperationId,
                TotalCost = moveTotalCost
            };

            _context.StockMoves.Add(move);

            var balanceAfter = await _stockBalance.DecreaseBalance(
                request.WarehouseId, request.ItemId, alloc.BatchId, alloc.QuantityBase, cancellationToken);

            _context.StockLedgerEntries.Add(new StockLedgerEntry
            {
                WarehouseId      = request.WarehouseId,
                ItemId           = request.ItemId,
                BatchId          = alloc.BatchId,
                StockMoveId      = move.Id,
                DocumentRef      = request.ClientOperationId,
                MoveType         = StockMoveType.Issue,
                Quantity         = moveQuantityOriginal,
                UnitCode         = request.UnitCode,
                QuantityBase     = -alloc.QuantityBase,     // negative — stock out
                BaseUnit         = item.BaseUnit,
                BalanceAfterBase = balanceAfter,
                AgroOperationId  = request.AgroOperationId,
                FieldId          = request.FieldId,
                TotalCost        = moveTotalCost,
                Note             = request.Note,
                CreatedAtUtc     = _dateTime.UtcNow,
            });

            issuedBatches.Add(new IssuedBatchDto(move.Id, alloc.BatchId, alloc.BatchCode, alloc.QuantityBase));
        }

        // Auto-create cost record for the full issue
        var totalCost = item.PurchasePrice.HasValue
            ? item.PurchasePrice.Value * request.Quantity
            : (decimal?)null;

        if (totalCost.HasValue && totalCost.Value > 0)
        {
            var costCategory = CostCategoryMapper.FromCategoryName(item.Category);

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

        return new IssueStockResultDto(issuedBatches);
    }

    /// <summary>
    /// Selects batches for the given item in the warehouse using FEFO (First Expiry, First Out)
    /// then FIFO (First In, First Out) strategy. Splits across multiple batches if needed.
    /// </summary>
    private async Task<List<BatchAllocation>> SelectBatchesFifoFefo(
        Guid warehouseId, Guid itemId, decimal requiredQuantityBase, CancellationToken cancellationToken)
    {
        // Load available batch balances with batch info, ordered by FEFO then FIFO:
        //   1. Batches with expiry date — ascending (earliest expiry first)
        //   2. Batches without expiry date — by received date ascending (FIFO)
        //   3. Non-batch balance (BatchId == null) — last resort
        var balances = await _context.StockBalances
            .Where(b => b.WarehouseId == warehouseId
                        && b.ItemId == itemId
                        && b.BalanceBase > 0
                        && !b.IsDeleted)
            .Join(
                _context.Batches.Where(batch => !batch.IsDeleted),
                sb => sb.BatchId,
                batch => batch.Id,
                (sb, batch) => new
                {
                    sb.BatchId,
                    batch.Code,
                    batch.ExpiryDate,
                    batch.ReceivedDate,
                    sb.BalanceBase,
                    HasBatch = true
                })
            .ToListAsync(cancellationToken);

        // Also include non-batch balances (BatchId == null)
        var unbatchedBalances = await _context.StockBalances
            .Where(b => b.WarehouseId == warehouseId
                        && b.ItemId == itemId
                        && b.BatchId == null
                        && b.BalanceBase > 0
                        && !b.IsDeleted)
            .Select(sb => new
            {
                sb.BatchId,
                Code = (string?)null,
                ExpiryDate = (DateTime?)null,
                ReceivedDate = DateTime.MaxValue,
                sb.BalanceBase,
                HasBatch = false
            })
            .ToListAsync(cancellationToken);

        var allBalances = balances
            .Select(b => new
            {
                b.BatchId,
                Code = (string?)b.Code,
                b.ExpiryDate,
                b.ReceivedDate,
                b.BalanceBase,
                b.HasBatch
            })
            .Concat(unbatchedBalances)
            .OrderBy(b => b.HasBatch ? 0 : 1)                          // batched first
            .ThenBy(b => b.ExpiryDate.HasValue ? 0 : 1)                // FEFO: expiry date present first
            .ThenBy(b => b.ExpiryDate ?? DateTime.MaxValue)             // FEFO: earliest expiry first
            .ThenBy(b => b.ReceivedDate)                                // FIFO: earliest received first
            .ToList();

        var totalAvailable = allBalances.Sum(b => b.BalanceBase);
        if (totalAvailable < requiredQuantityBase)
        {
            throw new InsufficientBalanceException(
                warehouseId, itemId, requiredQuantityBase, totalAvailable);
        }

        var allocations = new List<BatchAllocation>();
        var remaining = requiredQuantityBase;

        foreach (var balance in allBalances)
        {
            if (remaining <= 0) break;

            var take = Math.Min(remaining, balance.BalanceBase);
            allocations.Add(new BatchAllocation(balance.BatchId, balance.Code, take));
            remaining -= take;
        }

        return allocations;
    }

    private record BatchAllocation(Guid? BatchId, string? BatchCode, decimal QuantityBase);
}
