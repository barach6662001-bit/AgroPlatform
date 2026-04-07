using AgroPlatform.Domain.AgroOperations;
using AgroPlatform.Domain.Approval;
using AgroPlatform.Domain.Authorization;
using AgroPlatform.Domain.Common;
using AgroPlatform.Domain.Economics;
using AgroPlatform.Domain.Fields;
using AgroPlatform.Domain.Fuel;
using AgroPlatform.Domain.GrainStorage;
using GrainStorageEntity = AgroPlatform.Domain.GrainStorage.GrainStorage;
using AgroPlatform.Domain.HR;
using AgroPlatform.Domain.Machinery;
using AgroPlatform.Domain.Notifications;
using AgroPlatform.Domain.Sales;
using AgroPlatform.Domain.Users;
using AgroPlatform.Domain.Warehouses;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;

namespace AgroPlatform.Application.Common.Interfaces;

public interface IAppDbContext
{
    DatabaseFacade Database { get; }
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
    DbSet<FieldZone> FieldZones { get; }
    DbSet<SoilAnalysis> SoilAnalyses { get; }
    DbSet<FieldInspection> FieldInspections { get; }
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
    DbSet<PushSubscription> PushSubscriptions { get; }
    DbSet<MobilePushToken> MobilePushTokens { get; }
    DbSet<Tenant> Tenants { get; }
    DbSet<LandLease> LandLeases { get; }
    DbSet<LeasePayment> LeasePayments { get; }
    DbSet<GrainStorageEntity> GrainStorages { get; }
    DbSet<GrainType> GrainTypes { get; }
    DbSet<GrainBatch> GrainBatches { get; }
    DbSet<GrainMovement> GrainMovements { get; }
    DbSet<GrainTransfer> GrainTransfers { get; }
    DbSet<GrainBatchPlacement> GrainBatchPlacements { get; }
    DbSet<Employee> Employees { get; }
    DbSet<WorkLog> WorkLogs { get; }
    DbSet<SalaryPayment> SalaryPayments { get; }
    DbSet<FuelTank> FuelTanks { get; }
    DbSet<FuelTransaction> FuelTransactions { get; }
    DbSet<FuelNorm> FuelNorms { get; }
    DbSet<Sale> Sales { get; }
    DbSet<AppUser> Users { get; }
    DbSet<RolePermission> RolePermissions { get; }
    DbSet<AuditEntry> AuditEntries { get; }
    DbSet<Attachment> Attachments { get; }
    DbSet<ApiKey> ApiKeys { get; }
    DbSet<RefreshToken> RefreshTokens { get; }

    // Approval workflow
    DbSet<ApprovalRule> ApprovalRules { get; }
    DbSet<ApprovalRequest> ApprovalRequests { get; }

    // Immutable stock ledger
    DbSet<StockLedgerEntry> StockLedgerEntries { get; }

    // Item categories reference
    DbSet<ItemCategory> ItemCategories { get; }

    // Inventory sessions
    DbSet<InventorySession> InventorySessions { get; }
    DbSet<InventorySessionLine> InventorySessionLines { get; }

    // Global reference data — not tenant-scoped
    DbSet<UnitOfMeasure> UnitsOfMeasure { get; }
    DbSet<UnitConversionRule> UnitConversionRules { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
