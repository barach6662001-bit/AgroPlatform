using AgroPlatform.Domain.Enums;
using MediatR;

namespace AgroPlatform.Application.Economics.Commands.UpdateSale;

public record UpdateSaleCommand(
    Guid Id,
    string BuyerName,
    string? ContractNumber,
    CropType CropType,
    decimal QuantityTons,
    decimal PricePerTon,
    DateTime SaleDate,
    PaymentStatus PaymentStatus
) : IRequest;
