using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AgroPlatform.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddFieldHarvestSyncColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "GrainBatchId",
                table: "FieldHarvests",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "SyncedFromGrainStorage",
                table: "FieldHarvests",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "GrainBatchId",
                table: "FieldHarvests");

            migrationBuilder.DropColumn(
                name: "SyncedFromGrainStorage",
                table: "FieldHarvests");
        }
    }
}
