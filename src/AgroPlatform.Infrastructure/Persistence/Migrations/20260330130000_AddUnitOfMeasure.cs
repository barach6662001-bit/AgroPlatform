using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AgroPlatform.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddUnitOfMeasure : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "UnitsOfMeasure",
                columns: table => new
                {
                    Code     = table.Column<string>(type: "character varying(20)",  maxLength: 20,  nullable: false),
                    Name     = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Category = table.Column<string>(type: "character varying(50)",  maxLength: 50,  nullable: false),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UnitsOfMeasure", x => x.Code);
                });

            migrationBuilder.CreateTable(
                name: "UnitConversionRules",
                columns: table => new
                {
                    Id       = table.Column<Guid>(    type: "uuid",                                nullable: false),
                    FromUnit = table.Column<string>(  type: "character varying(20)", maxLength: 20, nullable: false),
                    ToUnit   = table.Column<string>(  type: "character varying(20)", maxLength: 20, nullable: false),
                    Factor   = table.Column<decimal>( type: "numeric(22,10)", precision: 22, scale: 10, nullable: false),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UnitConversionRules", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UnitConversionRules_UnitsOfMeasure_FromUnit",
                        column: x => x.FromUnit,
                        principalTable: "UnitsOfMeasure",
                        principalColumn: "Code",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_UnitConversionRules_UnitsOfMeasure_ToUnit",
                        column: x => x.ToUnit,
                        principalTable: "UnitsOfMeasure",
                        principalColumn: "Code",
                        onDelete: ReferentialAction.Restrict);
                });

            // ── Seed reference units ────────────────────────────────────────────
            migrationBuilder.InsertData(
                table: "UnitsOfMeasure",
                columns: new[] { "Code", "Name", "Category" },
                values: new object[,]
                {
                    { "kg",  "Kilogram",     "Mass"   },
                    { "ton", "Tonne",        "Mass"   },
                    { "g",   "Gram",         "Mass"   },
                    { "L",   "Litre",        "Volume" },
                    { "m3",  "Cubic metre",  "Volume" },
                    { "pcs", "Pieces",       "Count"  },
                    { "ha",  "Hectare",      "Area"   },
                });

            // ── Seed bidirectional conversion rules ─────────────────────────────
            migrationBuilder.InsertData(
                table: "UnitConversionRules",
                columns: new[] { "Id", "FromUnit", "ToUnit", "Factor" },
                values: new object[,]
                {
                    { new Guid("a0000000-0000-0000-0000-000000000001"), "kg",  "ton",  0.001m    },
                    { new Guid("a0000000-0000-0000-0000-000000000002"), "ton", "kg",   1000m     },
                    { new Guid("a0000000-0000-0000-0000-000000000003"), "g",   "kg",   0.001m    },
                    { new Guid("a0000000-0000-0000-0000-000000000004"), "kg",  "g",    1000m     },
                    { new Guid("a0000000-0000-0000-0000-000000000005"), "L",   "m3",   0.001m    },
                    { new Guid("a0000000-0000-0000-0000-000000000006"), "m3",  "L",    1000m     },
                });

            migrationBuilder.CreateIndex(
                name: "IX_UnitConversionRules_FromUnit_ToUnit",
                table: "UnitConversionRules",
                columns: new[] { "FromUnit", "ToUnit" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UnitConversionRules_ToUnit",
                table: "UnitConversionRules",
                column: "ToUnit");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "UnitConversionRules");
            migrationBuilder.DropTable(name: "UnitsOfMeasure");
        }
    }
}
