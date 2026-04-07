using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AgroPlatform.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddDataIntegrityChecks : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_GrainMovements_ClientOperationId",
                table: "GrainMovements",
                column: "ClientOperationId",
                unique: true,
                filter: "\"ClientOperationId\" IS NOT NULL");

            migrationBuilder.Sql(
                """
                ALTER TABLE "StockBalances"
                    ADD CONSTRAINT "CK_StockBalances_NonNegativeBalance"
                    CHECK ("BalanceBase" >= 0);
                """);

            migrationBuilder.Sql(
                """
                ALTER TABLE "FuelTanks"
                    ADD CONSTRAINT "CK_FuelTanks_NonNegativeCurrentLiters"
                    CHECK ("CurrentLiters" >= 0);
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                ALTER TABLE "FuelTanks"
                    DROP CONSTRAINT IF EXISTS "CK_FuelTanks_NonNegativeCurrentLiters";
                """);

            migrationBuilder.Sql(
                """
                ALTER TABLE "StockBalances"
                    DROP CONSTRAINT IF EXISTS "CK_StockBalances_NonNegativeBalance";
                """);

            migrationBuilder.DropIndex(
                name: "IX_GrainMovements_ClientOperationId",
                table: "GrainMovements");
        }
    }
}
