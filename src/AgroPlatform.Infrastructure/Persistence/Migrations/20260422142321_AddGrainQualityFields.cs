using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AgroPlatform.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddGrainQualityFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "GlutenPercent",
                table: "GrainBatches",
                type: "numeric(5,2)",
                precision: 5,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "GrainImpurityPercent",
                table: "GrainBatches",
                type: "numeric(5,2)",
                precision: 5,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "ImpurityPercent",
                table: "GrainBatches",
                type: "numeric(5,2)",
                precision: 5,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "NaturePerLiter",
                table: "GrainBatches",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "ProteinPercent",
                table: "GrainBatches",
                type: "numeric(5,2)",
                precision: 5,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "QualityClass",
                table: "GrainBatches",
                type: "integer",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "GlutenPercent",
                table: "GrainBatches");

            migrationBuilder.DropColumn(
                name: "GrainImpurityPercent",
                table: "GrainBatches");

            migrationBuilder.DropColumn(
                name: "ImpurityPercent",
                table: "GrainBatches");

            migrationBuilder.DropColumn(
                name: "NaturePerLiter",
                table: "GrainBatches");

            migrationBuilder.DropColumn(
                name: "ProteinPercent",
                table: "GrainBatches");

            migrationBuilder.DropColumn(
                name: "QualityClass",
                table: "GrainBatches");
        }
    }
}
