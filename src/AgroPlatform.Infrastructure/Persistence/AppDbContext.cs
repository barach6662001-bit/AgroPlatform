using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.AgroOperations;
using AgroPlatform.Domain.Approval;
using AgroPlatform.Domain.Authorization;
using AgroPlatform.Domain.Common;
using AgroPlatform.Domain.Economics;
using AgroPlatform.Domain.FeatureFlags;
using AgroPlatform.Domain.Fields;
using AgroPlatform.Domain.Fuel;
using AgroPlatform.Domain.GrainStorage;
using AgroPlatform.Domain.HR;
using AgroPlatform.Domain.Machinery;
using AgroPlatform.Domain.Notifications;
using AgroPlatform.Domain.Sales;
using AgroPlatform.Domain.Users;
using AgroPlatform.Domain.Warehouses;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;
using System.Reflection;

namespace AgroPlatform.Infrastructure.Persistence;

public class AppDbContext : IdentityDbContext<AppUser>, IAppDbContext
{
    private readonly Guid _tenantId;

    public AppDbContext(DbContextOptions<AppDbContext> options, ITenantService tenantService)
        : base(options)
    {
        _tenantId = tenantService.GetTenantId();
    }

    public DbSet<Warehouse> Warehouses => Set<Warehouse>();
    public DbSet<WarehouseItem> WarehouseItems => Set<WarehouseItem>();
    public DbSet<StockMove> StockMoves => Set<StockMove>();
    public DbSet<StockBalance> StockBalances => Set<StockBalance>();
    public DbSet<Batch> Batches => Set<Batch>();
    public DbSet<Field> Fields => Set<Field>();
    public DbSet<FieldCropHistory> FieldCropHistories => Set<FieldCropHistory>();
    public DbSet<CropRotationPlan> CropRotationPlans => Set<CropRotationPlan>();
    public DbSet<FieldSeeding> FieldSeedings => Set<FieldSeeding>();
    public DbSet<FieldFertilizer> FieldFertilizers => Set<FieldFertilizer>();
    public DbSet<FieldProtection> FieldProtections => Set<FieldProtection>();
    public DbSet<FieldHarvest> FieldHarvests => Set<FieldHarvest>();
    public DbSet<FieldZone> FieldZones => Set<FieldZone>();
    public DbSet<SoilAnalysis> SoilAnalyses => Set<SoilAnalysis>();
    public DbSet<FieldInspection> FieldInspections => Set<FieldInspection>();
    public DbSet<AgroOperation> AgroOperations => Set<AgroOperation>();
    public DbSet<AgroOperationResource> AgroOperationResources => Set<AgroOperationResource>();
    public DbSet<AgroOperationMachinery> AgroOperationMachineries => Set<AgroOperationMachinery>();
    public DbSet<Machine> Machines => Set<Machine>();
    public DbSet<MachineWorkLog> MachineWorkLogs => Set<MachineWorkLog>();
    public DbSet<FuelLog> FuelLogs => Set<FuelLog>();
    public DbSet<MaintenanceRecord> MaintenanceRecords => Set<MaintenanceRecord>();
    public DbSet<CostRecord> CostRecords => Set<CostRecord>();
    public DbSet<Budget> Budgets => Set<Budget>();
    public DbSet<GpsTrack> GpsTracks => Set<GpsTrack>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<PushSubscription> PushSubscriptions => Set<PushSubscription>();
    public DbSet<MobilePushToken> MobilePushTokens => Set<MobilePushToken>();
    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<LandLease> LandLeases => Set<LandLease>();
    public DbSet<LeasePayment> LeasePayments => Set<LeasePayment>();
    public DbSet<FuelTank> FuelTanks => Set<FuelTank>();
    public DbSet<FuelTransaction> FuelTransactions => Set<FuelTransaction>();
    public DbSet<FuelNorm> FuelNorms => Set<FuelNorm>();
    public DbSet<GrainStorage> GrainStorages => Set<GrainStorage>();
    public DbSet<GrainType> GrainTypes => Set<GrainType>();
    public DbSet<GrainBatch> GrainBatches => Set<GrainBatch>();
    public DbSet<GrainMovement> GrainMovements => Set<GrainMovement>();
    public DbSet<GrainTransfer> GrainTransfers => Set<GrainTransfer>();
    public DbSet<GrainBatchPlacement> GrainBatchPlacements => Set<GrainBatchPlacement>();
    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<WorkLog> WorkLogs => Set<WorkLog>();
    public DbSet<SalaryPayment> SalaryPayments => Set<SalaryPayment>();
    public DbSet<Sale> Sales => Set<Sale>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
    public DbSet<AuditEntry> AuditEntries => Set<AuditEntry>();
    public DbSet<Attachment> Attachments => Set<Attachment>();
    public DbSet<TenantFeatureFlag> TenantFeatureFlags => Set<TenantFeatureFlag>();
    public DbSet<ApiKey> ApiKeys => Set<ApiKey>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    // Approval workflow
    public DbSet<ApprovalRule> ApprovalRules => Set<ApprovalRule>();
    public DbSet<ApprovalRequest> ApprovalRequests => Set<ApprovalRequest>();

    // Immutable stock ledger
    public DbSet<StockLedgerEntry> StockLedgerEntries => Set<StockLedgerEntry>();

    // Item categories
    public DbSet<ItemCategory> ItemCategories => Set<ItemCategory>();

    // Inventory sessions
    public DbSet<InventorySession> InventorySessions => Set<InventorySession>();
    public DbSet<InventorySessionLine> InventorySessionLines => Set<InventorySessionLine>();

    // Global reference data — no tenant query filter applied
    public DbSet<UnitOfMeasure> UnitsOfMeasure => Set<UnitOfMeasure>();
    public DbSet<UnitConversionRule> UnitConversionRules => Set<UnitConversionRule>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.Ignore<DomainEvent>();
        builder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

        ApplyTenantQueryFilters(builder);
    }

    private void ApplyTenantQueryFilters(ModelBuilder builder)
    {
        var tenantIdField = typeof(AppDbContext)
            .GetField("_tenantId", BindingFlags.NonPublic | BindingFlags.Instance)!;
        var contextExpr = Expression.Constant(this);
        var tenantIdAccessExpr = Expression.Field(contextExpr, tenantIdField);

        foreach (var entityType in builder.Model.GetEntityTypes())
        {
            var clrType = entityType.ClrType;
            var isTenant = typeof(ITenantEntity).IsAssignableFrom(clrType);
            var isSoftDeletable = typeof(ISoftDeletable).IsAssignableFrom(clrType);

            // AuditEntry has TenantId but does not implement ITenantEntity
            var isAuditEntry = clrType == typeof(AuditEntry);

            if (!isTenant && !isAuditEntry)
                continue;

            var parameter = Expression.Parameter(clrType, "e");

            // Tenant filter: e.TenantId == _tenantId
            var tenantIdProp = Expression.Property(parameter, "TenantId");
            Expression filter = Expression.Equal(tenantIdProp, tenantIdAccessExpr);

            // Soft-delete filter: !e.IsDeleted
            if (isSoftDeletable)
            {
                var isDeletedProp = Expression.Property(parameter, nameof(ISoftDeletable.IsDeleted));
                var notDeleted = Expression.Not(isDeletedProp);
                filter = Expression.AndAlso(notDeleted, filter);
            }

            var lambda = Expression.Lambda(filter, parameter);
            builder.Entity(clrType).HasQueryFilter(lambda);
        }
    }
}
