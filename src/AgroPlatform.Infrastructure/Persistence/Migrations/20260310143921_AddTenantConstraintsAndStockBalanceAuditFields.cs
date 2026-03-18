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

            migrationBuilder.Sql(@"ALTER TABLE ""StockBalances"" ADD COLUMN IF NOT EXISTS ""CreatedAtUtc"" timestamp with time zone NOT NULL DEFAULT TIMESTAMPTZ '0001-01-01 00:00:00+00';");
            migrationBuilder.Sql(@"ALTER TABLE ""StockBalances"" ADD COLUMN IF NOT EXISTS ""CreatedBy"" text NULL;");
            migrationBuilder.Sql(@"ALTER TABLE ""StockBalances"" ADD COLUMN IF NOT EXISTS ""DeletedAtUtc"" timestamp with time zone NULL;");
            migrationBuilder.Sql(@"ALTER TABLE ""StockBalances"" ADD COLUMN IF NOT EXISTS ""IsDeleted"" boolean NOT NULL DEFAULT false;");
            migrationBuilder.Sql(@"ALTER TABLE ""StockBalances"" ADD COLUMN IF NOT EXISTS ""TenantId"" uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';");
            migrationBuilder.Sql(@"ALTER TABLE ""StockBalances"" ADD COLUMN IF NOT EXISTS ""UpdatedAtUtc"" timestamp with time zone NULL;");
            migrationBuilder.Sql(@"ALTER TABLE ""StockBalances"" ADD COLUMN IF NOT EXISTS ""UpdatedBy"" text NULL;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"ALTER TABLE ""StockBalances"" DROP COLUMN IF EXISTS ""CreatedAtUtc"";");
            migrationBuilder.Sql(@"ALTER TABLE ""StockBalances"" DROP COLUMN IF EXISTS ""CreatedBy"";");
            migrationBuilder.Sql(@"ALTER TABLE ""StockBalances"" DROP COLUMN IF EXISTS ""DeletedAtUtc"";");
            migrationBuilder.Sql(@"ALTER TABLE ""StockBalances"" DROP COLUMN IF EXISTS ""IsDeleted"";");
            migrationBuilder.Sql(@"ALTER TABLE ""StockBalances"" DROP COLUMN IF EXISTS ""TenantId"";");
            migrationBuilder.Sql(@"ALTER TABLE ""StockBalances"" DROP COLUMN IF EXISTS ""UpdatedAtUtc"";");
            migrationBuilder.Sql(@"ALTER TABLE ""StockBalances"" DROP COLUMN IF EXISTS ""UpdatedBy"";");

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
