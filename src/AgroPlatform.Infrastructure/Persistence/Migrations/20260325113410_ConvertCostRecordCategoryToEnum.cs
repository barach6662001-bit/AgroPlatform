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

            migrationBuilder.AlterColumn<string>(
                name: "Category",
                table: "CostRecords",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);

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

            migrationBuilder.AlterColumn<Guid>(
                name: "EntityId",
                table: "AuditEntries",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);

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
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ApiKeys");

            migrationBuilder.DropTable(
                name: "Permissions");

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
                name: "Category",
                table: "CostRecords",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50);

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
        }
    }
}
