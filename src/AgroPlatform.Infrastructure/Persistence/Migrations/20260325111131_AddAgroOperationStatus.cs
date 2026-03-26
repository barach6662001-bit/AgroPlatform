using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AgroPlatform.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddAgroOperationStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "AgroOperations",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "Planned");

            // Data migration: IsCompleted = true → Status = 'Completed', else 'Planned'
            migrationBuilder.Sql(
                "UPDATE \"AgroOperations\" SET \"Status\" = 'Completed' WHERE \"IsCompleted\" = true;");

            migrationBuilder.DropColumn(
                name: "IsCompleted",
                table: "AgroOperations");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Status",
                table: "AgroOperations");

            migrationBuilder.AddColumn<bool>(
                name: "IsCompleted",
                table: "AgroOperations",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }
    }
}
