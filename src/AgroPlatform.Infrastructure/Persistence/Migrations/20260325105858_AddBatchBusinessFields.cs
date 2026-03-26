using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AgroPlatform.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddBatchBusinessFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Batches_ItemId",
                table: "Batches");

            migrationBuilder.AddColumn<decimal>(
                name: "CostPerUnit",
                table: "Batches",
                type: "numeric(18,4)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ExpiryDate",
                table: "Batches",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ReceivedDate",
                table: "Batches",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "SupplierName",
                table: "Batches",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Batches_ItemId_ExpiryDate",
                table: "Batches",
                columns: new[] { "ItemId", "ExpiryDate" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Batches_ItemId_ExpiryDate",
                table: "Batches");

            migrationBuilder.DropColumn(
                name: "CostPerUnit",
                table: "Batches");

            migrationBuilder.DropColumn(
                name: "ExpiryDate",
                table: "Batches");

            migrationBuilder.DropColumn(
                name: "ReceivedDate",
                table: "Batches");

            migrationBuilder.DropColumn(
                name: "SupplierName",
                table: "Batches");

            migrationBuilder.CreateIndex(
                name: "IX_Batches_ItemId",
                table: "Batches",
                column: "ItemId");
        }
    }
}
