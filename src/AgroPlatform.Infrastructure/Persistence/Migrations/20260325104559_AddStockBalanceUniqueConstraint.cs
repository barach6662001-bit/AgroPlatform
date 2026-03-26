using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AgroPlatform.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddStockBalanceUniqueConstraint : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_StockBalances_WarehouseId_ItemId_BatchId",
                table: "StockBalances");

            migrationBuilder.RenameColumn(
                name: "Timestamp",
                table: "AuditEntries",
                newName: "CreatedAtUtc");

            migrationBuilder.RenameColumn(
                name: "Metadata",
                table: "AuditEntries",
                newName: "OldValues");

            migrationBuilder.RenameIndex(
                name: "IX_AuditEntries_TenantId_Timestamp",
                table: "AuditEntries",
                newName: "IX_AuditEntries_TenantId_CreatedAtUtc");

            // Ensure no NULLs before making UserId non-nullable
            migrationBuilder.Sql("UPDATE \"AuditEntries\" SET \"UserId\" = '' WHERE \"UserId\" IS NULL;");

            migrationBuilder.AlterColumn<string>(
                name: "UserId",
                table: "AuditEntries",
                type: "character varying(450)",
                maxLength: 450,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "character varying(450)",
                oldMaxLength: 450,
                oldNullable: true);

            // PostgreSQL requires explicit USING clause for varchar -> uuid cast
            migrationBuilder.Sql("UPDATE \"AuditEntries\" SET \"EntityId\" = '00000000-0000-0000-0000-000000000000' WHERE \"EntityId\" !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';");
            migrationBuilder.Sql("ALTER TABLE \"AuditEntries\" ALTER COLUMN \"EntityId\" TYPE uuid USING \"EntityId\"::uuid;");

            migrationBuilder.AddColumn<string>(
                name: "IpAddress",
                table: "AuditEntries",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NewValues",
                table: "AuditEntries",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Notes",
                table: "AuditEntries",
                type: "text",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ApiKeys",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    KeyHash = table.Column<string>(type: "text", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Scopes = table.Column<string>(type: "text", nullable: false),
                    ExpiresAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastUsedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsRevoked = table.Column<bool>(type: "boolean", nullable: false),
                    RateLimitPerHour = table.Column<int>(type: "integer", nullable: true),
                    WebhookEventTypes = table.Column<string>(type: "text", nullable: true),
                    WebhookUrl = table.Column<string>(type: "text", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApiKeys", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Permissions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    RoleId = table.Column<Guid>(type: "uuid", nullable: false),
                    Module = table.Column<string>(type: "text", nullable: false),
                    CanRead = table.Column<bool>(type: "boolean", nullable: false),
                    CanCreate = table.Column<bool>(type: "boolean", nullable: false),
                    CanUpdate = table.Column<bool>(type: "boolean", nullable: false),
                    CanDelete = table.Column<bool>(type: "boolean", nullable: false),
                    LastReviewedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    DeletedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Permissions", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_StockBalances_WarehouseId_ItemId_BatchId_TenantId",
                table: "StockBalances",
                columns: new[] { "WarehouseId", "ItemId", "BatchId", "TenantId" },
                unique: true,
                filter: "\"IsDeleted\" = false");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ApiKeys");

            migrationBuilder.DropTable(
                name: "Permissions");

            migrationBuilder.DropIndex(
                name: "IX_StockBalances_WarehouseId_ItemId_BatchId_TenantId",
                table: "StockBalances");

            migrationBuilder.DropColumn(
                name: "IpAddress",
                table: "AuditEntries");

            migrationBuilder.DropColumn(
                name: "NewValues",
                table: "AuditEntries");

            migrationBuilder.DropColumn(
                name: "Notes",
                table: "AuditEntries");

            migrationBuilder.RenameColumn(
                name: "OldValues",
                table: "AuditEntries",
                newName: "Metadata");

            migrationBuilder.RenameColumn(
                name: "CreatedAtUtc",
                table: "AuditEntries",
                newName: "Timestamp");

            migrationBuilder.RenameIndex(
                name: "IX_AuditEntries_TenantId_CreatedAtUtc",
                table: "AuditEntries",
                newName: "IX_AuditEntries_TenantId_Timestamp");

            migrationBuilder.AlterColumn<string>(
                name: "UserId",
                table: "AuditEntries",
                type: "character varying(450)",
                maxLength: 450,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(450)",
                oldMaxLength: 450);

            migrationBuilder.AlterColumn<string>(
                name: "EntityId",
                table: "AuditEntries",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.CreateIndex(
                name: "IX_StockBalances_WarehouseId_ItemId_BatchId",
                table: "StockBalances",
                columns: new[] { "WarehouseId", "ItemId", "BatchId" },
                unique: true);
        }
    }
}
