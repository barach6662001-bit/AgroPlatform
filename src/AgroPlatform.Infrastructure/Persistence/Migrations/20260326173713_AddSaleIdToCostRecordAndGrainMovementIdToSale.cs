using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AgroPlatform.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddSaleIdToCostRecordAndGrainMovementIdToSale : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "GrainMovementId",
                table: "Sales",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "SaleId",
                table: "CostRecords",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Sales_GrainMovementId",
                table: "Sales",
                column: "GrainMovementId",
                filter: "\"GrainMovementId\" IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_CostRecords_SaleId",
                table: "CostRecords",
                column: "SaleId",
                unique: true,
                filter: "\"SaleId\" IS NOT NULL");

            migrationBuilder.AddForeignKey(
                name: "FK_CostRecords_Sales_SaleId",
                table: "CostRecords",
                column: "SaleId",
                principalTable: "Sales",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Sales_GrainMovements_GrainMovementId",
                table: "Sales",
                column: "GrainMovementId",
                principalTable: "GrainMovements",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CostRecords_Sales_SaleId",
                table: "CostRecords");

            migrationBuilder.DropForeignKey(
                name: "FK_Sales_GrainMovements_GrainMovementId",
                table: "Sales");

            migrationBuilder.DropIndex(
                name: "IX_Sales_GrainMovementId",
                table: "Sales");

            migrationBuilder.DropIndex(
                name: "IX_CostRecords_SaleId",
                table: "CostRecords");

            migrationBuilder.DropColumn(
                name: "GrainMovementId",
                table: "Sales");

            migrationBuilder.DropColumn(
                name: "SaleId",
                table: "CostRecords");
        }
    }
}
