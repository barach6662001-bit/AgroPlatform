using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AgroPlatform.Infrastructure.Persistence.Migrations;

/// <inheritdoc />
public partial class AddRolePermissions : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "RolePermissions",
            columns: table => new
            {
                RoleName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                PolicyName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                IsGranted = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_RolePermissions", x => new { x.RoleName, x.PolicyName });
            });

        // Seed rows — only IsGranted=true rows are inserted.
        // "Administrator" is omitted: it normalizes to "Admin" at runtime (admin short-circuit).
        // "Viewer" is omitted: no manage grants → handler returns empty set → denied.

        void Grant(string role, string policy) =>
            migrationBuilder.InsertData(
                table: "RolePermissions",
                columns: new[] { "RoleName", "PolicyName", "IsGranted" },
                values: new object[] { role, policy, true });

        // Admin — all 10 manage policies
        Grant("Admin", "Warehouses.Manage");
        Grant("Admin", "Inventory.Manage");
        Grant("Admin", "Machinery.Manage");
        Grant("Admin", "Fields.Manage");
        Grant("Admin", "Economics.Manage");
        Grant("Admin", "HR.Manage");
        Grant("Admin", "GrainStorage.Manage");
        Grant("Admin", "Fuel.Manage");
        Grant("Admin", "Sales.Manage");
        Grant("Admin", "Admin.Manage");

        // Manager — all except Admin.Manage
        Grant("Manager", "Warehouses.Manage");
        Grant("Manager", "Inventory.Manage");
        Grant("Manager", "Machinery.Manage");
        Grant("Manager", "Fields.Manage");
        Grant("Manager", "Economics.Manage");
        Grant("Manager", "HR.Manage");
        Grant("Manager", "GrainStorage.Manage");
        Grant("Manager", "Fuel.Manage");
        Grant("Manager", "Sales.Manage");

        // Agronomist
        Grant("Agronomist", "Fields.Manage");

        // Storekeeper
        Grant("Storekeeper", "Warehouses.Manage");
        Grant("Storekeeper", "Inventory.Manage");
        Grant("Storekeeper", "GrainStorage.Manage");
        Grant("Storekeeper", "Fuel.Manage");

        // Director
        Grant("Director", "Economics.Manage");
        Grant("Director", "Sales.Manage");

        // Operator
        Grant("Operator", "Warehouses.Manage");
        Grant("Operator", "Inventory.Manage");
        Grant("Operator", "Fields.Manage");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(name: "RolePermissions");
    }
}
