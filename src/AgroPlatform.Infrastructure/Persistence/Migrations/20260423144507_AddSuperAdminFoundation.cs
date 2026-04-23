using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AgroPlatform.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddSuperAdminFoundation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsSuperAdmin",
                table: "AspNetUsers",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "SuperAdminAuditLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    AdminUserId = table.Column<string>(type: "character varying(450)", maxLength: 450, nullable: false),
                    Action = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    TargetType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    TargetId = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Before = table.Column<string>(type: "jsonb", nullable: true),
                    After = table.Column<string>(type: "jsonb", nullable: true),
                    IpAddress = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                    UserAgent = table.Column<string>(type: "character varying(512)", maxLength: 512, nullable: true),
                    OccurredAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SuperAdminAuditLogs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UserMfaSettings",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "character varying(450)", maxLength: 450, nullable: false),
                    SecretKey = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    IsEnabled = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    BackupCodes = table.Column<string>(type: "jsonb", nullable: false, defaultValue: "[]"),
                    EnabledAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserMfaSettings", x => x.UserId);
                    table.ForeignKey(
                        name: "FK_UserMfaSettings_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SuperAdminAuditLogs_AdminUserId",
                table: "SuperAdminAuditLogs",
                column: "AdminUserId");

            migrationBuilder.CreateIndex(
                name: "IX_SuperAdminAuditLogs_OccurredAt",
                table: "SuperAdminAuditLogs",
                column: "OccurredAt");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SuperAdminAuditLogs");

            migrationBuilder.DropTable(
                name: "UserMfaSettings");

            migrationBuilder.DropColumn(
                name: "IsSuperAdmin",
                table: "AspNetUsers");
        }
    }
}
