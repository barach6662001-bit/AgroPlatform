using AgroPlatform.Domain.Common;
using AgroPlatform.Domain.Enums;

namespace AgroPlatform.Domain.Warehouses;

/// <summary>
/// Append-only ledger entry for every warehouse stock movement.
/// Never update or soft-delete; immutability is enforced at the DB config level (no update/delete FK actions on this table).
/// </summary>
public class StockLedgerEntry : ITenantEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();

    // ── Multi-tenancy ──────────────────────────────────────────────────────
    public Guid TenantId { get; set; }   // set by TenantInterceptor

    // ── Inventory location ─────────────────────────────────────────────────
    public Guid WarehouseId { get; set; }
    public Guid ItemId      { get; set; }
    public Guid? BatchId    { get; set; }

    // ── Document refs ──────────────────────────────────────────────────────
    public Guid? StockMoveId   { get; set; }  // FK to StockMoves (no navigation to stay append-only)
    public Guid? OperationId   { get; set; }  // links two legs of a transfer
    public string? DocumentRef { get; set; }  // idempotency key / external ref

    // ── Movement ───────────────────────────────────────────────────────────
    public StockMoveType MoveType    { get; set; }
    public decimal       Quantity    { get; set; }          // original amount in UnitCode (always > 0)
    public string        UnitCode    { get; set; } = string.Empty;
    public decimal       QuantityBase { get; set; }         // signed: + = in, – = out, in BaseUnit
    public string        BaseUnit    { get; set; } = string.Empty;

    // ── Running balance ────────────────────────────────────────────────────
    /// <summary>StockBalance.BalanceBase for (Warehouse, Item, Batch) after this entry is applied.</summary>
    public decimal BalanceAfterBase { get; set; }

    // ── Optional operation refs ────────────────────────────────────────────
    public Guid? AgroOperationId { get; set; }
    public Guid? FieldId         { get; set; }

    // ── Financial ──────────────────────────────────────────────────────────
    public decimal? TotalCost { get; set; }

    // ── Audit (append-only, no UpdatedAt/By) ──────────────────────────────
    public string?   Note         { get; set; }
    public string?   CreatedBy    { get; set; }
    public DateTime  CreatedAtUtc { get; set; }
}
