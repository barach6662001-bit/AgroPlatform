using MediatR;

namespace AgroPlatform.Application.Sales.Commands.CreateSale;

public record CreateSaleCommand(
    DateTime Date,
    string BuyerName,
    string Product,
    decimal Quantity,
    string Unit,
    decimal PricePerUnit,
    string Currency,
    Guid? FieldId,
    string? Notes
) : IRequest<Guid>;
