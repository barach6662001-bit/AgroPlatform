using MediatR;
using AgroPlatform.Application.Economics.Queries.ExportCostRecords;

namespace AgroPlatform.Application.Warehouses.Queries.ExportBalances;

public record ExportBalancesQuery(Guid? WarehouseId) : IRequest<ExportResult>;
