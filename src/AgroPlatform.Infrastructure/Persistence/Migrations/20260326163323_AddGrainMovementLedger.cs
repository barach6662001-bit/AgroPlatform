using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AgroPlatform.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddGrainMovementLedger : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_GrainMovements_GrainBatchId",
                table: "GrainMovements");

            migrationBuilder.AlterColumn<string>(
                name: "Reason",
                table: "GrainMovements",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Notes",
                table: "GrainMovements",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "MovementType",
                table: "GrainMovements",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(10)",
                oldMaxLength: 10);

            // Data migration: convert legacy 'In'/'Out' string values to new enum names
            migrationBuilder.Sql(@"
                UPDATE ""GrainMovements""
                SET ""MovementType"" = CASE
                    WHEN ""MovementType"" = 'In' THEN 'Receipt'
                    WHEN ""MovementType"" = 'Out' AND (""BuyerName"" IS NOT NULL OR ""PricePerTon"" IS NOT NULL) THEN 'SaleDispatch'
                    WHEN ""MovementType"" = 'Out' THEN 'Issue'
                    WHEN ""MovementType"" = 'Sale' THEN 'SaleDispatch'
                    ELSE ""MovementType""
                END
                WHERE ""MovementType"" IN ('In', 'Out', 'Sale');
            ");

            migrationBuilder.AlterColumn<string>(
                name: "BuyerName",
                table: "GrainMovements",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "OperationId",
                table: "GrainMovements",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "SourceBatchId",
                table: "GrainMovements",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "SourceStorageId",
                table: "GrainMovements",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TargetBatchId",
                table: "GrainMovements",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "TargetStorageId",
                table: "GrainMovements",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_GrainMovements_GrainBatchId_MovementDate",
                table: "GrainMovements",
                columns: new[] { "GrainBatchId", "MovementDate" });

            migrationBuilder.CreateIndex(
                name: "IX_GrainMovements_OperationId",
                table: "GrainMovements",
                column: "OperationId",
                filter: "operation_id IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_GrainMovements_SourceStorageId",
                table: "GrainMovements",
                column: "SourceStorageId");

            migrationBuilder.CreateIndex(
                name: "IX_GrainMovements_TargetStorageId",
                table: "GrainMovements",
                column: "TargetStorageId");

            migrationBuilder.AddForeignKey(
                name: "FK_GrainMovements_GrainStorages_SourceStorageId",
                table: "GrainMovements",
                column: "SourceStorageId",
                principalTable: "GrainStorages",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_GrainMovements_GrainStorages_TargetStorageId",
                table: "GrainMovements",
                column: "TargetStorageId",
                principalTable: "GrainStorages",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_GrainMovements_GrainStorages_SourceStorageId",
                table: "GrainMovements");

            migrationBuilder.DropForeignKey(
                name: "FK_GrainMovements_GrainStorages_TargetStorageId",
                table: "GrainMovements");

            migrationBuilder.DropIndex(
                name: "IX_GrainMovements_GrainBatchId_MovementDate",
                table: "GrainMovements");

            migrationBuilder.DropIndex(
                name: "IX_GrainMovements_OperationId",
                table: "GrainMovements");

            migrationBuilder.DropIndex(
                name: "IX_GrainMovements_SourceStorageId",
                table: "GrainMovements");

            migrationBuilder.DropIndex(
                name: "IX_GrainMovements_TargetStorageId",
                table: "GrainMovements");

            migrationBuilder.DropColumn(
                name: "OperationId",
                table: "GrainMovements");

            migrationBuilder.DropColumn(
                name: "SourceBatchId",
                table: "GrainMovements");

            migrationBuilder.DropColumn(
                name: "SourceStorageId",
                table: "GrainMovements");

            migrationBuilder.DropColumn(
                name: "TargetBatchId",
                table: "GrainMovements");

            migrationBuilder.DropColumn(
                name: "TargetStorageId",
                table: "GrainMovements");

            migrationBuilder.AlterColumn<string>(
                name: "Reason",
                table: "GrainMovements",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Notes",
                table: "GrainMovements",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(1000)",
                oldMaxLength: 1000,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "MovementType",
                table: "GrainMovements",
                type: "character varying(10)",
                maxLength: 10,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(20)",
                oldMaxLength: 20);

            migrationBuilder.AlterColumn<string>(
                name: "BuyerName",
                table: "GrainMovements",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(200)",
                oldMaxLength: 200,
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_GrainMovements_GrainBatchId",
                table: "GrainMovements",
                column: "GrainBatchId");
        }
    }
}
