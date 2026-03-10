using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AgroPlatform.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddTenantConstraintsAndStockBalanceAuditFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:PostgresExtension:postgis", ",,");

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "Tenants",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Inn",
                table: "Tenants",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAtUtc",
                table: "StockBalances",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "StockBalances",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletedAtUtc",
                table: "StockBalances",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "StockBalances",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<Guid>(
                name: "TenantId",
                table: "StockBalances",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAtUtc",
                table: "StockBalances",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UpdatedBy",
                table: "StockBalances",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreatedAtUtc",
                table: "StockBalances");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "StockBalances");

            migrationBuilder.DropColumn(
                name: "DeletedAtUtc",
                table: "StockBalances");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "StockBalances");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "StockBalances");

            migrationBuilder.DropColumn(
                name: "UpdatedAtUtc",
                table: "StockBalances");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "StockBalances");

            migrationBuilder.AlterDatabase()
                .OldAnnotation("Npgsql:PostgresExtension:postgis", ",,");

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "Tenants",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(200)",
                oldMaxLength: 200);

            migrationBuilder.AlterColumn<string>(
                name: "Inn",
                table: "Tenants",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50,
                oldNullable: true);
        }
    }
}
