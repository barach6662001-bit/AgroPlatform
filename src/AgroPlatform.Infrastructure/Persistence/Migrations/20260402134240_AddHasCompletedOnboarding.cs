using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AgroPlatform.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddHasCompletedOnboarding : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ClientOperationId",
                table: "GrainMovements",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "HasCompletedOnboarding",
                table: "AspNetUsers",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ClientOperationId",
                table: "GrainMovements");

            migrationBuilder.DropColumn(
                name: "HasCompletedOnboarding",
                table: "AspNetUsers");
        }
    }
}
