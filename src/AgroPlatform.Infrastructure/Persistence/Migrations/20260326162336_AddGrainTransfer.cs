using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AgroPlatform.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddGrainTransfer : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "GrainTransferId",
                table: "GrainMovements",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "GrainTransfers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SourceBatchId = table.Column<Guid>(type: "uuid", nullable: false),
                    TargetBatchId = table.Column<Guid>(type: "uuid", nullable: false),
                    QuantityTons = table.Column<decimal>(type: "numeric(18,4)", precision: 18, scale: 4, nullable: false),
                    TransferDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
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
                    table.PrimaryKey("PK_GrainTransfers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GrainTransfers_GrainBatches_SourceBatchId",
                        column: x => x.SourceBatchId,
                        principalTable: "GrainBatches",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_GrainTransfers_GrainBatches_TargetBatchId",
                        column: x => x.TargetBatchId,
                        principalTable: "GrainBatches",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_GrainMovements_GrainTransferId",
                table: "GrainMovements",
                column: "GrainTransferId");

            migrationBuilder.CreateIndex(
                name: "IX_GrainTransfers_SourceBatchId",
                table: "GrainTransfers",
                column: "SourceBatchId");

            migrationBuilder.CreateIndex(
                name: "IX_GrainTransfers_TargetBatchId",
                table: "GrainTransfers",
                column: "TargetBatchId");

            migrationBuilder.CreateIndex(
                name: "IX_GrainTransfers_TenantId",
                table: "GrainTransfers",
                column: "TenantId");

            // Ensure no pre-existing constraint before adding (handles CI environments
            // where pgdata volume may retain state from a previous failed migration run).
            migrationBuilder.Sql(@"ALTER TABLE ""GrainMovements"" DROP CONSTRAINT IF EXISTS ""FK_GrainMovements_GrainTransfers_GrainTransferId"";");

            migrationBuilder.AddForeignKey(
                name: "FK_GrainMovements_GrainTransfers_GrainTransferId",
                table: "GrainMovements",
                column: "GrainTransferId",
                principalTable: "GrainTransfers",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'FK_GrainMovements_GrainTransfers_GrainTransferId'
    ) THEN
        ALTER TABLE ""GrainMovements""
        DROP CONSTRAINT ""FK_GrainMovements_GrainTransfers_GrainTransferId"";
    END IF;
END $$;
");

            migrationBuilder.DropTable(
                name: "GrainTransfers");

            migrationBuilder.DropIndex(
                name: "IX_GrainMovements_GrainTransferId",
                table: "GrainMovements");

            migrationBuilder.DropColumn(
                name: "GrainTransferId",
                table: "GrainMovements");
        }
    }
}
