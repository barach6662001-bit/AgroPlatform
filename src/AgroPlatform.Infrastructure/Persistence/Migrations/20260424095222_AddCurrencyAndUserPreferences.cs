using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AgroPlatform.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddCurrencyAndUserPreferences : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ExchangeRates",
                columns: table => new
                {
                    Code = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false),
                    Date = table.Column<DateOnly>(type: "date", nullable: false),
                    RateToUah = table.Column<decimal>(type: "numeric(18,6)", nullable: false),
                    FetchedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExchangeRates", x => new { x.Code, x.Date });
                });

            migrationBuilder.CreateTable(
                name: "UserPreferences",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "character varying(450)", maxLength: 450, nullable: false),
                    PreferredCurrency = table.Column<string>(type: "character varying(3)", maxLength: 3, nullable: false, defaultValue: "UAH"),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserPreferences", x => x.UserId);
                    table.ForeignKey(
                        name: "FK_UserPreferences_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ExchangeRates_Date",
                table: "ExchangeRates",
                column: "Date");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ExchangeRates");

            migrationBuilder.DropTable(
                name: "UserPreferences");
        }
    }
}
