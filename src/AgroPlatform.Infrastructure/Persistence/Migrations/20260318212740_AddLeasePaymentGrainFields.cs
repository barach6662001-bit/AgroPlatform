using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AgroPlatform.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddLeasePaymentGrainFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "GrainBatchId",
                table: "LeasePayments",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "GrainPricePerTon",
                table: "LeasePayments",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "GrainQuantityTons",
                table: "LeasePayments",
                type: "numeric(18,4)",
                precision: 18,
                scale: 4,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PaymentMethod",
                table: "LeasePayments",
                type: "character varying(10)",
                maxLength: 10,
                nullable: false,
                defaultValue: "Cash");

            migrationBuilder.CreateIndex(
                name: "IX_LeasePayments_GrainBatchId",
                table: "LeasePayments",
                column: "GrainBatchId");

            migrationBuilder.AddForeignKey(
                name: "FK_LeasePayments_GrainBatches",
                table: "LeasePayments",
                column: "GrainBatchId",
                principalTable: "GrainBatches",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LeasePayments_GrainBatches",
                table: "LeasePayments");

            migrationBuilder.DropIndex(
                name: "IX_LeasePayments_GrainBatchId",
                table: "LeasePayments");

            migrationBuilder.DropColumn(
                name: "GrainBatchId",
                table: "LeasePayments");

            migrationBuilder.DropColumn(
                name: "GrainPricePerTon",
                table: "LeasePayments");

            migrationBuilder.DropColumn(
                name: "GrainQuantityTons",
                table: "LeasePayments");

            migrationBuilder.DropColumn(
                name: "PaymentMethod",
                table: "LeasePayments");
        }
    }
}
