using MediatR;

namespace AgroPlatform.Application.Warehouses.Commands.IssueStock;

public record IssueStockCommand(
    Guid WarehouseId,
    Guid ItemId,
    Guid? BatchId,
    decimal Quantity,
    string UnitCode,
    Guid? FieldId,
    Guid? AgroOperationId,
    string? Note,
    string? ClientOperationId
) : IRequest<Guid>;
