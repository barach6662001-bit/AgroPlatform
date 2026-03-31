using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AgroPlatform.Infrastructure.Persistence.Migrations
{
    public partial class FullSchemaSync : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "RequirePasswordChange",
                table: "AspNetUsers",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "CreatedByUserId",
                table: "AspNetUsers",
                type: "text",
                nullable: true);

            migrationBuilder.Sql(@"UPDATE ""AspNetUsers"" SET ""Role"" = CASE ""Role"" WHEN 0 THEN 1 WHEN 1 THEN 2 WHEN 2 THEN 2 WHEN 3 THEN 3 WHEN 4 THEN 4 WHEN 5 THEN 1 WHEN 6 THEN 3 WHEN 7 THEN 5 ELSE 5 END;");

            migrationBuilder.Sql(@"UPDATE ""AspNetUsers"" SET ""RequirePasswordChange"" = false;");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "RequirePasswordChange", table: "AspNetUsers");
            migrationBuilder.DropColumn(name: "CreatedByUserId", table: "AspNetUsers");
        }
    }
}
