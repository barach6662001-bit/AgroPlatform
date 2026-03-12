using AgroPlatform.Application.Economics.Queries.ExportCostRecords;
using MediatR;

namespace AgroPlatform.Application.Machinery.Queries.ExportMaintenanceRecords;

public record ExportMaintenanceRecordsQuery(Guid MachineId) : IRequest<ExportResult>;
