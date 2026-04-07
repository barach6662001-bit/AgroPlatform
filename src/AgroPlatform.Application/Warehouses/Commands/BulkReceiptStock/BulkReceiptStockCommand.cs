using MediatR;

namespace AgroPlatform.Application.Warehouses.Commands.BulkReceiptStock;

public record BulkReceiptStockCommand(
    Guid WarehouseId,
    List<BulkReceiptLineDto> Lines,
    string? ClientOperationId
) : IRequest<BulkReceiptStockResultDto>;

public record BulkReceiptLineDto(
    Guid ItemId,
    decimal Quantity,
    string UnitCode,
    decimal? PricePerUnit,
    string? BatchCode,
    DateTime? ReceivedDate,
    DateTime? ExpiryDate,
    string? SupplierName,
    string? Note
);

public record BulkReceiptStockResultDto(
    int TotalLines,
    int SuccessCount,
    List<BulkReceiptLineResultDto> Results
);

public record BulkReceiptLineResultDto(
    Guid ItemId,
    Guid? MoveId,
    bool Success,
    string? Error
);
