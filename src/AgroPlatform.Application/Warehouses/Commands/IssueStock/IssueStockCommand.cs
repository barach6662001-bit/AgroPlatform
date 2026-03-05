using MediatR;

namespace AgroPlatform.Application.Warehouses.Commands.IssueStock;

public record IssueStockCommand(
    Guid WarehouseId,
    Guid ItemId,
    decimal Quantity,
    string UnitCode,
    string? Note
) : IRequest<Guid>;
