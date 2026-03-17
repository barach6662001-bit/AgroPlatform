using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.AgroOperations;
using AgroPlatform.Domain.Economics;
using AgroPlatform.Domain.Fields;
using AgroPlatform.Domain.Fuel;
using AgroPlatform.Domain.Machinery;
using AgroPlatform.Domain.Notifications;
using AgroPlatform.Domain.Users;
using AgroPlatform.Domain.Warehouses;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

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
    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<LandLease> LandLeases => Set<LandLease>();
    public DbSet<LeasePayment> LeasePayments => Set<LeasePayment>();
    public DbSet<FuelTank> FuelTanks => Set<FuelTank>();
    public DbSet<FuelTransaction> FuelTransactions => Set<FuelTransaction>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

        // Combined tenant + soft-delete query filters (overrides individual configs)
        builder.Entity<Field>().HasQueryFilter(f => !f.IsDeleted && f.TenantId == _tenantId);
        builder.Entity<FieldCropHistory>().HasQueryFilter(f => !f.IsDeleted && f.TenantId == _tenantId);
        builder.Entity<CropRotationPlan>().HasQueryFilter(f => !f.IsDeleted && f.TenantId == _tenantId);
        builder.Entity<AgroOperation>().HasQueryFilter(o => !o.IsDeleted && o.TenantId == _tenantId);
        builder.Entity<AgroOperationResource>().HasQueryFilter(r => !r.IsDeleted && r.TenantId == _tenantId);
        builder.Entity<AgroOperationMachinery>().HasQueryFilter(m => !m.IsDeleted && m.TenantId == _tenantId);
        builder.Entity<Machine>().HasQueryFilter(m => !m.IsDeleted && m.TenantId == _tenantId);
        builder.Entity<MachineWorkLog>().HasQueryFilter(w => !w.IsDeleted && w.TenantId == _tenantId);
        builder.Entity<FuelLog>().HasQueryFilter(f => !f.IsDeleted && f.TenantId == _tenantId);
        builder.Entity<MaintenanceRecord>().HasQueryFilter(m => !m.IsDeleted && m.TenantId == _tenantId);
        builder.Entity<CostRecord>().HasQueryFilter(c => !c.IsDeleted && c.TenantId == _tenantId);
        builder.Entity<Budget>().HasQueryFilter(b => !b.IsDeleted && b.TenantId == _tenantId);
        builder.Entity<GpsTrack>().HasQueryFilter(g => !g.IsDeleted && g.TenantId == _tenantId);
        builder.Entity<Warehouse>().HasQueryFilter(w => !w.IsDeleted && w.TenantId == _tenantId);
        builder.Entity<WarehouseItem>().HasQueryFilter(i => !i.IsDeleted && i.TenantId == _tenantId);
        builder.Entity<StockMove>().HasQueryFilter(s => !s.IsDeleted && s.TenantId == _tenantId);
        builder.Entity<StockBalance>().HasQueryFilter(sb => !sb.IsDeleted && sb.TenantId == _tenantId);
        builder.Entity<Batch>().HasQueryFilter(b => !b.IsDeleted && b.TenantId == _tenantId);
        builder.Entity<Notification>().HasQueryFilter(n => n.TenantId == _tenantId);
        builder.Entity<LandLease>().HasQueryFilter(l => !l.IsDeleted && l.TenantId == _tenantId);
        builder.Entity<LeasePayment>().HasQueryFilter(p => !p.IsDeleted && p.TenantId == _tenantId);
        builder.Entity<FuelTank>().HasQueryFilter(f => !f.IsDeleted && f.TenantId == _tenantId);
        builder.Entity<FuelTransaction>().HasQueryFilter(f => !f.IsDeleted && f.TenantId == _tenantId);
    }
}
