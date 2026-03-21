using MediatR;

namespace AgroPlatform.Application.Sales.Commands.UpdateSale;

public record UpdateSaleCommand(
    Guid Id,
    DateTime Date,
    string BuyerName,
    string Product,
    decimal Quantity,
    string Unit,
    decimal PricePerUnit,
    string Currency,
    Guid? FieldId,
    string? Notes
) : IRequest;
