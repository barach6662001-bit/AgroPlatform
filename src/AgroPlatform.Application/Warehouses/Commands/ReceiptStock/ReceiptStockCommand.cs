using MediatR;

namespace AgroPlatform.Application.Warehouses.Commands.ReceiptStock;

public record ReceiptStockCommand(
    Guid WarehouseId,
    Guid ItemId,
    Guid? BatchId,
    decimal Quantity,
    string UnitCode,
    decimal? PricePerUnit,
    string? Note,
    string? ClientOperationId,
    string? BatchCode,
    DateTime? ReceivedDate,
    DateTime? ExpiryDate,
    string? SupplierName,
    decimal? CostPerUnit
) : IRequest<Guid>;
