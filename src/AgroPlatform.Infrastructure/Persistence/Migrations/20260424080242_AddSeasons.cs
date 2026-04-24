using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AgroPlatform.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddSeasons : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Seasons",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    StartDate = table.Column<DateOnly>(type: "date", nullable: false),
                    EndDate = table.Column<DateOnly>(type: "date", nullable: false),
                    IsCurrent = table.Column<bool>(type: "boolean", nullable: false),
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
                    table.PrimaryKey("PK_Seasons", x => x.Id);
                    table.CheckConstraint("CK_Seasons_EndAfterStart", "\"EndDate\" > \"StartDate\"");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Seasons_TenantId_Code",
                table: "Seasons",
                columns: new[] { "TenantId", "Code" },
                unique: true,
                filter: "\"IsDeleted\" = false");

            migrationBuilder.CreateIndex(
                name: "IX_Seasons_TenantId_IsCurrent_Unique",
                table: "Seasons",
                columns: new[] { "TenantId", "IsCurrent" },
                unique: true,
                filter: "\"IsCurrent\" = true AND \"IsDeleted\" = false");

            // Idempotent seed: give every existing tenant three default seasons
            // (2023/2024, 2024/2025, 2025/2026), running Aug 1 → Jul 31.
            // Only the 2025/2026 season is flagged as current. The NOT EXISTS guard
            // keeps the migration safe to replay against databases where seasons
            // have already been created (e.g. re-running on a developer machine).
            migrationBuilder.Sql(@"
DO $$
DECLARE
    t RECORD;
    now_utc timestamptz := NOW() AT TIME ZONE 'UTC';
BEGIN
    FOR t IN SELECT ""Id"" FROM ""Tenants"" WHERE ""IsActive"" = true LOOP
        IF NOT EXISTS (SELECT 1 FROM ""Seasons"" WHERE ""TenantId"" = t.""Id"") THEN
            INSERT INTO ""Seasons""
                (""Id"", ""Code"", ""Name"", ""StartDate"", ""EndDate"", ""IsCurrent"", ""TenantId"", ""CreatedAtUtc"", ""IsDeleted"")
            VALUES
                (gen_random_uuid(), '2023/2024', 'Сезон 2023/2024', DATE '2023-08-01', DATE '2024-07-31', false, t.""Id"", now_utc, false),
                (gen_random_uuid(), '2024/2025', 'Сезон 2024/2025', DATE '2024-08-01', DATE '2025-07-31', false, t.""Id"", now_utc, false),
                (gen_random_uuid(), '2025/2026', 'Сезон 2025/2026', DATE '2025-08-01', DATE '2026-07-31', true,  t.""Id"", now_utc, false);
        END IF;
    END LOOP;
END $$;
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Seasons");
        }
    }
}
