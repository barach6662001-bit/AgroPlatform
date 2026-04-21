using MediatR;

namespace AgroPlatform.Application.Warehouses.Commands.InventoryAdjust;

public record InventoryAdjustCommand(
    Guid WarehouseId,
    Guid ItemId,
    Guid? BatchId,
    decimal ActualQuantity,
    string UnitCode,
    string? Note,
    string? ClientOperationId
) : IRequest<InventoryAdjustResultDto>;
