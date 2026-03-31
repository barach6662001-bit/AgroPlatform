namespace AgroPlatform.Application.Warehouses.Commands.IssueStock;

public record IssueStockResultDto(
    List<IssuedBatchDto> IssuedBatches
);

public record IssuedBatchDto(
    Guid StockMoveId,
    Guid? BatchId,
    string? BatchCode,
    decimal QuantityBase
);
