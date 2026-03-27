using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AgroPlatform.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddGrainBatchRowVersion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "GrainBatches",
                type: "bytea",
                rowVersion: true,
                nullable: false,
                defaultValue: new byte[0]);

            migrationBuilder.AddForeignKey(
                name: "FK_GrainMovements_GrainTransfers_GrainTransferId",
                table: "GrainMovements",
                column: "GrainTransferId",
                principalTable: "GrainTransfers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_GrainTransfers_GrainBatches_SourceBatchId",
                table: "GrainTransfers",
                column: "SourceBatchId",
                principalTable: "GrainBatches",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_GrainTransfers_GrainBatches_TargetBatchId",
                table: "GrainTransfers",
                column: "TargetBatchId",
                principalTable: "GrainBatches",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_GrainMovements_GrainTransfers_GrainTransferId",
                table: "GrainMovements");

            migrationBuilder.DropForeignKey(
                name: "FK_GrainTransfers_GrainBatches_SourceBatchId",
                table: "GrainTransfers");

            migrationBuilder.DropForeignKey(
                name: "FK_GrainTransfers_GrainBatches_TargetBatchId",
                table: "GrainTransfers");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "GrainBatches");
        }
    }
}
