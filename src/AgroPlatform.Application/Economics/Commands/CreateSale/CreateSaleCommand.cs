using AgroPlatform.Domain.Enums;
using MediatR;

namespace AgroPlatform.Application.Economics.Commands.CreateSale;

public record CreateSaleCommand(
    string BuyerName,
    string? ContractNumber,
    CropType CropType,
    decimal QuantityTons,
    decimal PricePerTon,
    DateTime SaleDate,
    PaymentStatus PaymentStatus,
    Guid? GrainBatchId
) : IRequest<Guid>;
