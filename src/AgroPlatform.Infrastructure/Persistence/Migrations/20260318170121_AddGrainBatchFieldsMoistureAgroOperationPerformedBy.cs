using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AgroPlatform.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddGrainBatchFieldsMoistureAgroOperationPerformedBy : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "PricePerTon",
                table: "GrainMovements",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "TotalRevenue",
                table: "GrainMovements",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "MoisturePercent",
                table: "GrainBatches",
                type: "numeric(5,2)",
                precision: 5,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "SourceFieldId",
                table: "GrainBatches",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "PerformedByEmployeeId",
                table: "AgroOperations",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PerformedByName",
                table: "AgroOperations",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_GrainBatches_SourceFieldId",
                table: "GrainBatches",
                column: "SourceFieldId");

            migrationBuilder.AddForeignKey(
                name: "FK_GrainBatches_Fields_SourceFieldId",
                table: "GrainBatches",
                column: "SourceFieldId",
                principalTable: "Fields",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_GrainBatches_Fields_SourceFieldId",
                table: "GrainBatches");

            migrationBuilder.DropIndex(
                name: "IX_GrainBatches_SourceFieldId",
                table: "GrainBatches");

            migrationBuilder.DropColumn(
                name: "PricePerTon",
                table: "GrainMovements");

            migrationBuilder.DropColumn(
                name: "TotalRevenue",
                table: "GrainMovements");

            migrationBuilder.DropColumn(
                name: "MoisturePercent",
                table: "GrainBatches");

            migrationBuilder.DropColumn(
                name: "SourceFieldId",
                table: "GrainBatches");

            migrationBuilder.DropColumn(
                name: "PerformedByEmployeeId",
                table: "AgroOperations");

            migrationBuilder.DropColumn(
                name: "PerformedByName",
                table: "AgroOperations");
        }
    }
}
