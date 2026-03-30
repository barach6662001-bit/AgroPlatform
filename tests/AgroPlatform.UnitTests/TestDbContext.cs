using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.AgroOperations;
using AgroPlatform.Domain.Authorization;
using AgroPlatform.Domain.Common;
using AgroPlatform.Domain.Economics;
using AgroPlatform.Domain.Fields;
using AgroPlatform.Domain.Fuel;
using GrainStorageEntities = AgroPlatform.Domain.GrainStorage;
using AgroPlatform.Domain.HR;
using AgroPlatform.Domain.Machinery;
using AgroPlatform.Domain.Notifications;
using AgroPlatform.Domain.Sales;
using AgroPlatform.Domain.Users;
using AgroPlatform.Domain.Warehouses;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.UnitTests;

public class TestDbContext : DbContext, IAppDbContext
{
    public TestDbContext(DbContextOptions<TestDbContext> options) : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.Ignore<DomainEvent>();

        modelBuilder.Entity<UnitOfMeasure>(e =>
        {
            e.HasKey(u => u.Code);
            e.Property(u => u.Code).HasMaxLength(20);
        });

        modelBuilder.Entity<UnitConversionRule>(e =>
        {
            e.HasKey(r => r.Id);
            e.HasIndex(r => new { r.FromUnit, r.ToUnit }).IsUnique();
            e.HasOne(r => r.From).WithMany(u => u.FromRules).HasForeignKey(r => r.FromUnit);
            e.HasOne(r => r.To).WithMany(u => u.ToRules).HasForeignKey(r => r.ToUnit);
        });
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
    public DbSet<FieldInspection> FieldInspections => Set<FieldInspection>();
    public DbSet<FieldFertilizer> FieldFertilizers => Set<FieldFertilizer>();
    public DbSet<FieldProtection> FieldProtections => Set<FieldProtection>();
    public DbSet<FieldHarvest> FieldHarvests => Set<FieldHarvest>();
    public DbSet<FieldZone> FieldZones => Set<FieldZone>();
    public DbSet<SoilAnalysis> SoilAnalyses => Set<SoilAnalysis>();
    public DbSet<AgroOperation> AgroOperations => Set<AgroOperation>();
    public DbSet<AgroOperationResource> AgroOperationResources => Set<AgroOperationResource>();
    public DbSet<AgroOperationMachinery> AgroOperationMachineries => Set<AgroOperationMachinery>();
    public DbSet<Machine> Machines => Set<Machine>();
    public DbSet<MachineWorkLog> MachineWorkLogs => Set<MachineWorkLog>();
    public DbSet<FuelLog> FuelLogs => Set<FuelLog>();
    public DbSet<CostRecord> CostRecords => Set<CostRecord>();
    public DbSet<MaintenanceRecord> MaintenanceRecords => Set<MaintenanceRecord>();
    public DbSet<Budget> Budgets => Set<Budget>();
    public DbSet<GpsTrack> GpsTracks => Set<GpsTrack>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<PushSubscription> PushSubscriptions => Set<PushSubscription>();
    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<LandLease> LandLeases => Set<LandLease>();
    public DbSet<LeasePayment> LeasePayments => Set<LeasePayment>();
    public DbSet<FuelTank> FuelTanks => Set<FuelTank>();
    public DbSet<FuelTransaction> FuelTransactions => Set<FuelTransaction>();
    public DbSet<GrainStorageEntities.GrainStorage> GrainStorages => Set<GrainStorageEntities.GrainStorage>();
    public DbSet<GrainStorageEntities.GrainType> GrainTypes => Set<GrainStorageEntities.GrainType>();
    public DbSet<GrainStorageEntities.GrainBatch> GrainBatches => Set<GrainStorageEntities.GrainBatch>();
    public DbSet<GrainStorageEntities.GrainMovement> GrainMovements => Set<GrainStorageEntities.GrainMovement>();
    public DbSet<GrainStorageEntities.GrainTransfer> GrainTransfers => Set<GrainStorageEntities.GrainTransfer>();
    public DbSet<GrainStorageEntities.GrainBatchPlacement> GrainBatchPlacements => Set<GrainStorageEntities.GrainBatchPlacement>();
    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<WorkLog> WorkLogs => Set<WorkLog>();
    public DbSet<SalaryPayment> SalaryPayments => Set<SalaryPayment>();
    public DbSet<Sale> Sales => Set<Sale>();
    public DbSet<AppUser> Users => Set<AppUser>();
    public DbSet<Permission> Permissions => Set<Permission>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
    public DbSet<AuditEntry> AuditEntries => Set<AuditEntry>();
    public DbSet<ApiKey> ApiKeys => Set<ApiKey>();
    public DbSet<StockLedgerEntry> StockLedgerEntries => Set<StockLedgerEntry>();
    public DbSet<UnitOfMeasure> UnitsOfMeasure => Set<UnitOfMeasure>();
    public DbSet<UnitConversionRule> UnitConversionRules => Set<UnitConversionRule>();
}
