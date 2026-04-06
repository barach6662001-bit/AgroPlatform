using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AgroPlatform.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddPhase1CriticalFixes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "Machines",
                type: "bytea",
                rowVersion: true,
                nullable: false,
                defaultValueSql: "'\\x00'::bytea");

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "FuelTanks",
                type: "bytea",
                rowVersion: true,
                nullable: false,
                defaultValueSql: "'\\x00'::bytea");

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "Fields",
                type: "bytea",
                rowVersion: true,
                nullable: false,
                defaultValueSql: "'\\x00'::bytea");

            migrationBuilder.CreateIndex(
                name: "IX_StockMoves_OperationId",
                table: "StockMoves",
                column: "OperationId",
                filter: "\"OperationId\" IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_StockMoves_OperationId",
                table: "StockMoves");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "Machines");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "FuelTanks");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "Fields");
        }
    }
}
