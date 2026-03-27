using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AgroPlatform.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddGrainBatchPlacements : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Step 1: Create the new GrainBatchPlacements table
            migrationBuilder.CreateTable(
                name: "GrainBatchPlacements",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    GrainBatchId = table.Column<Guid>(type: "uuid", nullable: false),
                    GrainStorageId = table.Column<Guid>(type: "uuid", nullable: false),
                    GrainStorageUnitId = table.Column<Guid>(type: "uuid", nullable: true),
                    QuantityTons = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
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
                    table.PrimaryKey("PK_GrainBatchPlacements", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GrainBatchPlacements_GrainBatches_GrainBatchId",
                        column: x => x.GrainBatchId,
                        principalTable: "GrainBatches",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_GrainBatchPlacements_GrainStorages_GrainStorageId",
                        column: x => x.GrainStorageId,
                        principalTable: "GrainStorages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_GrainBatchPlacements_GrainBatchId",
                table: "GrainBatchPlacements",
                column: "GrainBatchId");

            migrationBuilder.CreateIndex(
                name: "IX_GrainBatchPlacements_GrainStorageId",
                table: "GrainBatchPlacements",
                column: "GrainStorageId");

            migrationBuilder.CreateIndex(
                name: "IX_GrainBatchPlacements_TenantId",
                table: "GrainBatchPlacements",
                column: "TenantId");

            // Step 2: Backfill — create one placement per existing grain batch using the legacy GrainStorageId
            migrationBuilder.Sql(@"
                INSERT INTO ""GrainBatchPlacements"" (
                    ""Id"", ""GrainBatchId"", ""GrainStorageId"", ""GrainStorageUnitId"",
                    ""QuantityTons"", ""TenantId"", ""CreatedAtUtc"", ""IsDeleted""
                )
                SELECT
                    gen_random_uuid(),
                    b.""Id"",
                    b.""GrainStorageId"",
                    NULL,
                    b.""QuantityTons"",
                    b.""TenantId"",
                    NOW() AT TIME ZONE 'UTC',
                    false
                FROM ""GrainBatches"" b
                WHERE b.""IsDeleted"" = false
                  AND b.""GrainStorageId"" IS NOT NULL
                  AND b.""GrainStorageId"" != '00000000-0000-0000-0000-000000000000'
                  AND NOT EXISTS (
                      SELECT 1 FROM ""GrainBatchPlacements"" p
                      WHERE p.""GrainBatchId"" = b.""Id"" AND p.""IsDeleted"" = false
                  )
            ");

            // Step 3: Remove the legacy GrainStorageId FK, index, and column
            migrationBuilder.DropForeignKey(
                name: "FK_GrainBatches_GrainStorages_GrainStorageId",
                table: "GrainBatches");

            migrationBuilder.DropIndex(
                name: "IX_GrainBatches_GrainStorageId",
                table: "GrainBatches");

            migrationBuilder.DropColumn(
                name: "GrainStorageId",
                table: "GrainBatches");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Restore GrainStorageId column from first placement (lossy if batch has multiple placements)
            migrationBuilder.AddColumn<Guid>(
                name: "GrainStorageId",
                table: "GrainBatches",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.Sql(@"
                UPDATE ""GrainBatches"" b
                SET ""GrainStorageId"" = (
                    SELECT p.""GrainStorageId""
                    FROM ""GrainBatchPlacements"" p
                    WHERE p.""GrainBatchId"" = b.""Id"" AND p.""IsDeleted"" = false
                    ORDER BY p.""CreatedAtUtc"" ASC
                    LIMIT 1
                )
                WHERE EXISTS (
                    SELECT 1 FROM ""GrainBatchPlacements"" p
                    WHERE p.""GrainBatchId"" = b.""Id"" AND p.""IsDeleted"" = false
                )
            ");

            migrationBuilder.CreateIndex(
                name: "IX_GrainBatches_GrainStorageId",
                table: "GrainBatches",
                column: "GrainStorageId");

            migrationBuilder.AddForeignKey(
                name: "FK_GrainBatches_GrainStorages_GrainStorageId",
                table: "GrainBatches",
                column: "GrainStorageId",
                principalTable: "GrainStorages",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.DropTable(
                name: "GrainBatchPlacements");
        }
    }
}
