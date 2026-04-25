using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AgroPlatform.Infrastructure.Persistence.Migrations
{
    /// <summary>
    /// PR #614: partial composite index supporting the impersonation rate-limit
    /// query (3 sessions per (admin, target) per 24h). The query is:
    ///   SELECT COUNT(*) FROM "SuperAdminAuditLogs"
    ///   WHERE "Action" = 'impersonate.start'
    ///     AND "AdminUserId" = @admin
    ///     AND "TargetId" = @target
    ///     AND "OccurredAt" &gt;= @since
    /// The partial filter (Action = 'impersonate.start') keeps the index small
    /// even as the audit log grows across all super-admin actions.
    /// </summary>
    public partial class AddImpersonationRateLimitIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                CREATE INDEX IF NOT EXISTS ""ix_superadminauditlogs_impersonation_ratelimit""
                ON ""SuperAdminAuditLogs"" (""AdminUserId"", ""TargetId"", ""OccurredAt"" DESC)
                WHERE ""Action"" = 'impersonate.start';
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                DROP INDEX IF EXISTS ""ix_superadminauditlogs_impersonation_ratelimit"";
            ");
        }
    }
}
