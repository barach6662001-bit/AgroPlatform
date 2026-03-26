using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AgroPlatform.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddPerformanceIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_FieldSeedings_FieldId_Year",
                table: "FieldSeedings",
                columns: new[] { "FieldId", "Year" });

            migrationBuilder.CreateIndex(
                name: "IX_FieldHarvests_FieldId_Year",
                table: "FieldHarvests",
                columns: new[] { "FieldId", "Year" });

            migrationBuilder.CreateIndex(
                name: "IX_CostRecords_TenantId_Category",
                table: "CostRecords",
                columns: new[] { "TenantId", "Category" });

            migrationBuilder.CreateIndex(
                name: "IX_CostRecords_TenantId_FieldId",
                table: "CostRecords",
                columns: new[] { "TenantId", "FieldId" });

            migrationBuilder.CreateIndex(
                name: "IX_AgroOperations_TenantId_FieldId",
                table: "AgroOperations",
                columns: new[] { "TenantId", "FieldId" });

            migrationBuilder.CreateIndex(
                name: "IX_AgroOperations_TenantId_Status",
                table: "AgroOperations",
                columns: new[] { "TenantId", "Status" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_FieldSeedings_FieldId_Year",
                table: "FieldSeedings");

            migrationBuilder.DropIndex(
                name: "IX_FieldHarvests_FieldId_Year",
                table: "FieldHarvests");

            migrationBuilder.DropIndex(
                name: "IX_CostRecords_TenantId_Category",
                table: "CostRecords");

            migrationBuilder.DropIndex(
                name: "IX_CostRecords_TenantId_FieldId",
                table: "CostRecords");

            migrationBuilder.DropIndex(
                name: "IX_AgroOperations_TenantId_FieldId",
                table: "AgroOperations");

            migrationBuilder.DropIndex(
                name: "IX_AgroOperations_TenantId_Status",
                table: "AgroOperations");
        }
    }
}
