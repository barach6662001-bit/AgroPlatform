using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AgroPlatform.Infrastructure.Persistence.Migrations;

/// <inheritdoc />
public partial class AddStockLedger : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "StockLedgerEntries",
            columns: table => new
            {
                Id = table.Column<Guid>(type: "uuid", nullable: false),
                TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                WarehouseId = table.Column<Guid>(type: "uuid", nullable: false),
                ItemId = table.Column<Guid>(type: "uuid", nullable: false),
                BatchId = table.Column<Guid>(type: "uuid", nullable: true),
                StockMoveId = table.Column<Guid>(type: "uuid", nullable: true),
                OperationId = table.Column<Guid>(type: "uuid", nullable: true),
                DocumentRef = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                MoveType = table.Column<int>(type: "integer", nullable: false),
                Quantity = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                UnitCode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                QuantityBase = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                BaseUnit = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                BalanceAfterBase = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                AgroOperationId = table.Column<Guid>(type: "uuid", nullable: true),
                FieldId = table.Column<Guid>(type: "uuid", nullable: true),
                TotalCost = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                Note = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                CreatedBy = table.Column<string>(type: "text", nullable: true),
                CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_StockLedgerEntries", x => x.Id);
            });

        migrationBuilder.CreateIndex(
            name: "IX_StockLedgerEntries_OperationId",
            table: "StockLedgerEntries",
            column: "OperationId",
            filter: "\"OperationId\" IS NOT NULL");

        migrationBuilder.CreateIndex(
            name: "IX_StockLedgerEntries_StockMoveId",
            table: "StockLedgerEntries",
            column: "StockMoveId",
            filter: "\"StockMoveId\" IS NOT NULL");

        migrationBuilder.CreateIndex(
            name: "IX_StockLedgerEntries_WarehouseId_ItemId_CreatedAtUtc",
            table: "StockLedgerEntries",
            columns: new[] { "WarehouseId", "ItemId", "CreatedAtUtc" });
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(name: "StockLedgerEntries");
    }
}
