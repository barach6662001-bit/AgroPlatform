using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.AgroOperations;
using AgroPlatform.Domain.Economics;
using AgroPlatform.Domain.Fields;
using AgroPlatform.Domain.Machinery;
using AgroPlatform.Domain.Notifications;
using AgroPlatform.Domain.Users;
using AgroPlatform.Domain.Warehouses;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.UnitTests;

public class TestDbContext : DbContext, IAppDbContext
{
    public TestDbContext(DbContextOptions<TestDbContext> options) : base(options) { }

    public DbSet<Warehouse> Warehouses => Set<Warehouse>();
    public DbSet<WarehouseItem> WarehouseItems => Set<WarehouseItem>();
    public DbSet<StockMove> StockMoves => Set<StockMove>();
    public DbSet<StockBalance> StockBalances => Set<StockBalance>();
    public DbSet<Batch> Batches => Set<Batch>();
    public DbSet<Field> Fields => Set<Field>();
    public DbSet<FieldCropHistory> FieldCropHistories => Set<FieldCropHistory>();
    public DbSet<CropRotationPlan> CropRotationPlans => Set<CropRotationPlan>();
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
    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<LandLease> LandLeases => Set<LandLease>();
    public DbSet<LeasePayment> LeasePayments => Set<LeasePayment>();
}
