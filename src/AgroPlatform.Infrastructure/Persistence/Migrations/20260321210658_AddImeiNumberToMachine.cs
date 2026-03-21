using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AgroPlatform.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddImeiNumberToMachine : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ImeiNumber",
                table: "Machines",
                type: "character varying(15)",
                maxLength: 15,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Machines_ImeiNumber",
                table: "Machines",
                column: "ImeiNumber",
                unique: true,
                filter: "\"ImeiNumber\" IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Machines_ImeiNumber",
                table: "Machines");

            migrationBuilder.DropColumn(
                name: "ImeiNumber",
                table: "Machines");
        }
    }
}
