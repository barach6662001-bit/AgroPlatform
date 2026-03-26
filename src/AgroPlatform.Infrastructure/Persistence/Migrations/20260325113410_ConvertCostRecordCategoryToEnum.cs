using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AgroPlatform.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class ConvertCostRecordCategoryToEnum : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Normalize existing CostRecord category strings to enum names
            migrationBuilder.Sql("UPDATE \"CostRecords\" SET \"Category\" = 'Fertilizer' WHERE \"Category\" = 'Fertilizers';");
            migrationBuilder.Sql("UPDATE \"CostRecords\" SET \"Category\" = 'Pesticide' WHERE \"Category\" = 'Pesticides';");
            migrationBuilder.Sql("UPDATE \"CostRecords\" SET \"Category\" = 'Machinery' WHERE \"Category\" IN ('Equipment', 'Machinery');");
            migrationBuilder.Sql("UPDATE \"CostRecords\" SET \"Category\" = 'Labor' WHERE \"Category\" IN ('Salary', 'Labor');");
            migrationBuilder.Sql("UPDATE \"CostRecords\" SET \"Category\" = 'Other' WHERE \"Category\" NOT IN ('Fuel', 'Seeds', 'Fertilizer', 'Pesticide', 'Machinery', 'Labor', 'Lease', 'Other');");

            migrationBuilder.AlterColumn<string>(
                name: "Category",
                table: "CostRecords",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Category",
                table: "CostRecords",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50);
        }
    }
}
