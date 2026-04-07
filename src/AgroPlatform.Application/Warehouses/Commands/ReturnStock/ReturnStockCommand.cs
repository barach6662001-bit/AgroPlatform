using MediatR;

namespace AgroPlatform.Application.Warehouses.Commands.ReturnStock;

public record ReturnStockCommand(
    Guid WarehouseId,
    Guid ItemId,
    Guid? BatchId,
    decimal Quantity,
    string UnitCode,
    string? Note,
    string? ClientOperationId,
    Guid? OriginalIssueMoveId
) : IRequest<Guid>;
