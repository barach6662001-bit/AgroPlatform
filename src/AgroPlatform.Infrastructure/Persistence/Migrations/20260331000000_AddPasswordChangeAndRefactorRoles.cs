using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AgroPlatform.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddPasswordChangeAndRefactorRoles : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Add new columns
            migrationBuilder.AddColumn<bool>(
                name: "RequirePasswordChange",
                table: "AspNetUsers",
                type: "boolean",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<string>(
                name: "CreatedByUserId",
                table: "AspNetUsers",
                type: "text",
                nullable: true);

            // Remap old Role enum integer values to new enum values
            migrationBuilder.Sql("""
                UPDATE "AspNetUsers" SET "Role" = CASE "Role"
                    WHEN 0 THEN 1   -- old Administrator (0) → new CompanyAdmin (1)
                    WHEN 1 THEN 2   -- old Manager (1) → new Manager (2)
                    WHEN 2 THEN 2   -- old Agronomist (2) → new Manager (2)
                    WHEN 3 THEN 3   -- old Storekeeper (3) → new WarehouseOperator (3)
                    WHEN 4 THEN 4   -- old Director (4) → new Accountant (4)
                    WHEN 5 THEN 1   -- old Admin (5) → new CompanyAdmin (1)
                    WHEN 6 THEN 3   -- old Operator (6) → new WarehouseOperator (3)
                    WHEN 7 THEN 5   -- old Viewer (7) → new Viewer (5)
                    ELSE 5           -- fallback → Viewer
                END;
                """);

            // Existing users should NOT be forced to change password
            migrationBuilder.Sql("""
                UPDATE "AspNetUsers" SET "RequirePasswordChange" = false;
                """);

            // Clear old role permission rows to allow re-seeding with new role names
            migrationBuilder.Sql("""DELETE FROM "RolePermissions";""");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "RequirePasswordChange", table: "AspNetUsers");
            migrationBuilder.DropColumn(name: "CreatedByUserId", table: "AspNetUsers");
        }
    }
}
