using AgroPlatform.Application.Economics.Queries.ExportCostRecords;
using MediatR;

namespace AgroPlatform.Application.Economics.Queries.ExportBudgets;

public record ExportBudgetsQuery(int Year) : IRequest<ExportResult>;
