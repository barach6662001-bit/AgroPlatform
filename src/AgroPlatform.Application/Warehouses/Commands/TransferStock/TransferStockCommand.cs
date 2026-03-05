using MediatR;

namespace AgroPlatform.Application.Warehouses.Commands.TransferStock;

public record TransferStockCommand(
    Guid SourceWarehouseId,
    Guid DestinationWarehouseId,
    Guid ItemId,
    Guid? BatchId,
    decimal Quantity,
    string UnitCode,
    string? Note,
    string? ClientOperationId
) : IRequest<Guid>;
