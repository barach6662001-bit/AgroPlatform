using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AgroPlatform.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddGrainStorageEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<byte[]>(
                name: "RowVersion",
                table: "StockBalances",
                type: "bytea",
                nullable: false,
                defaultValueSql: "'\\x00'::bytea",
                oldClrType: typeof(byte[]),
                oldType: "bytea",
                oldRowVersion: true);

            migrationBuilder.CreateTable(
                name: "GrainStorages",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    Location = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    StorageType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    CapacityTons = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    Notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
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
                    table.PrimaryKey("PK_GrainStorages", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_GrainStorages_TenantId",
                table: "GrainStorages",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_GrainStorages_TenantId_Code",
                table: "GrainStorages",
                columns: new[] { "TenantId", "Code" },
                unique: true,
                filter: "\"Code\" IS NOT NULL AND \"IsDeleted\" = false");

            // Migrate any existing GrainBatches that reference Warehouse IDs (legacy data)
            // by creating placeholder GrainStorage records so the FK constraint below can succeed.
            migrationBuilder.Sql(@"
                INSERT INTO ""GrainStorages"" (""Id"", ""Name"", ""TenantId"", ""IsActive"", ""IsDeleted"", ""CreatedAtUtc"")
                SELECT DISTINCT
                    gb.""GrainStorageId"",
                    COALESCE(w.""Name"", 'Зерносховище (імпортовано)'),
                    gb.""TenantId"",
                    true,
                    false,
                    NOW() AT TIME ZONE 'UTC'
                FROM ""GrainBatches"" gb
                LEFT JOIN ""Warehouses"" w ON w.""Id"" = gb.""GrainStorageId""
                WHERE gb.""GrainStorageId"" NOT IN (SELECT ""Id"" FROM ""GrainStorages"")
            ");

            migrationBuilder.AddForeignKey(
                name: "FK_GrainBatches_GrainStorages_GrainStorageId",
                table: "GrainBatches",
                column: "GrainStorageId",
                principalTable: "GrainStorages",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_GrainBatches_GrainStorages_GrainStorageId",
                table: "GrainBatches");

            migrationBuilder.DropTable(
                name: "GrainStorages");

            migrationBuilder.AlterColumn<byte[]>(
                name: "RowVersion",
                table: "StockBalances",
                type: "bytea",
                rowVersion: true,
                nullable: false,
                oldClrType: typeof(byte[]),
                oldType: "bytea",
                oldDefaultValueSql: "'\\x00'::bytea");
        }
    }
}
