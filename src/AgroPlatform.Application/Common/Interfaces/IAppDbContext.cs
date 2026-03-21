using AgroPlatform.Domain.AgroOperations;
using AgroPlatform.Domain.Economics;
using AgroPlatform.Domain.Fields;
using AgroPlatform.Domain.Fuel;
using AgroPlatform.Domain.GrainStorage;
using AgroPlatform.Domain.HR;
using AgroPlatform.Domain.Machinery;
using AgroPlatform.Domain.Notifications;
using AgroPlatform.Domain.Users;
using AgroPlatform.Domain.Warehouses;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Common.Interfaces;

public interface IAppDbContext
{
    DbSet<Warehouse> Warehouses { get; }
    DbSet<WarehouseItem> WarehouseItems { get; }
    DbSet<StockMove> StockMoves { get; }
    DbSet<StockBalance> StockBalances { get; }
    DbSet<Batch> Batches { get; }
    DbSet<Field> Fields { get; }
    DbSet<FieldCropHistory> FieldCropHistories { get; }
    DbSet<CropRotationPlan> CropRotationPlans { get; }
    DbSet<FieldSeeding> FieldSeedings { get; }
    DbSet<FieldFertilizer> FieldFertilizers { get; }
    DbSet<FieldProtection> FieldProtections { get; }
    DbSet<FieldHarvest> FieldHarvests { get; }
    DbSet<SoilAnalysis> SoilAnalyses { get; }
    DbSet<AgroOperation> AgroOperations { get; }
    DbSet<AgroOperationResource> AgroOperationResources { get; }
    DbSet<AgroOperationMachinery> AgroOperationMachineries { get; }
    DbSet<Machine> Machines { get; }
    DbSet<MachineWorkLog> MachineWorkLogs { get; }
    DbSet<FuelLog> FuelLogs { get; }
    DbSet<MaintenanceRecord> MaintenanceRecords { get; }
    DbSet<CostRecord> CostRecords { get; }
    DbSet<Budget> Budgets { get; }
    DbSet<GpsTrack> GpsTracks { get; }
    DbSet<Notification> Notifications { get; }
    DbSet<Tenant> Tenants { get; }
    DbSet<LandLease> LandLeases { get; }
    DbSet<LeasePayment> LeasePayments { get; }
    DbSet<GrainType> GrainTypes { get; }
    DbSet<GrainBatch> GrainBatches { get; }
    DbSet<GrainMovement> GrainMovements { get; }
    DbSet<Employee> Employees { get; }
    DbSet<WorkLog> WorkLogs { get; }
    DbSet<SalaryPayment> SalaryPayments { get; }
    DbSet<FuelTank> FuelTanks { get; }
    DbSet<FuelTransaction> FuelTransactions { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
