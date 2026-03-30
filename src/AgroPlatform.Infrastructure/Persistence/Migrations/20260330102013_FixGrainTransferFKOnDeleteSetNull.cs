using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AgroPlatform.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class FixGrainTransferFKOnDeleteSetNull : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Idempotent drop: handle environments where FK may or may not have ON DELETE SET NULL
            migrationBuilder.Sql(@"ALTER TABLE ""GrainMovements"" DROP CONSTRAINT IF EXISTS ""FK_GrainMovements_GrainTransfers_GrainTransferId"";");

            migrationBuilder.AlterColumn<byte[]>(
                name: "RowVersion",
                table: "GrainBatches",
                type: "bytea",
                rowVersion: true,
                nullable: false,
                defaultValueSql: "'\\x00'::bytea",
                oldClrType: typeof(byte[]),
                oldType: "bytea",
                oldRowVersion: true);

            migrationBuilder.AddForeignKey(
                name: "FK_GrainMovements_GrainTransfers_GrainTransferId",
                table: "GrainMovements",
                column: "GrainTransferId",
                principalTable: "GrainTransfers",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_GrainMovements_GrainTransfers_GrainTransferId",
                table: "GrainMovements");

            migrationBuilder.AlterColumn<byte[]>(
                name: "RowVersion",
                table: "GrainBatches",
                type: "bytea",
                rowVersion: true,
                nullable: false,
                oldClrType: typeof(byte[]),
                oldType: "bytea",
                oldRowVersion: true,
                oldDefaultValueSql: "'\\x00'::bytea");

            migrationBuilder.AddForeignKey(
                name: "FK_GrainMovements_GrainTransfers_GrainTransferId",
                table: "GrainMovements",
                column: "GrainTransferId",
                principalTable: "GrainTransfers",
                principalColumn: "Id");
        }
    }
}
