using Microsoft.EntityFrameworkCore.Migrations;
using NetTopologySuite.Geometries;

#nullable disable

namespace AgroPlatform.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddFieldGeometry : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Geometry>(
                name: "Geometry",
                table: "Fields",
                type: "geometry(Polygon, 4326)",
                nullable: true);

            migrationBuilder.Sql(
                "CREATE INDEX IF NOT EXISTS ix_fields_geometry ON \"Fields\" USING GIST (\"Geometry\");");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP INDEX IF EXISTS ix_fields_geometry;");

            migrationBuilder.DropColumn(
                name: "Geometry",
                table: "Fields");
        }
    }
}
