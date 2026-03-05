using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.AgroOperations;
using AgroPlatform.Domain.Economics;
using AgroPlatform.Domain.Fields;
using AgroPlatform.Domain.Machinery;
using AgroPlatform.Domain.Users;
using AgroPlatform.Domain.Warehouses;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Infrastructure.Persistence;

public class AppDbContext : IdentityDbContext<AppUser>, IAppDbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

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
    public DbSet<Tenant> Tenants => Set<Tenant>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
