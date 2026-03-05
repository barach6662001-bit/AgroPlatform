using MediatR;

namespace AgroPlatform.Application.Warehouses.Commands.TransferStock;

public record TransferStockCommand(
    Guid SourceWarehouseId,
    Guid DestinationWarehouseId,
    Guid ItemId,
    decimal Quantity,
    string UnitCode,
    string? Note
) : IRequest<Guid>;
