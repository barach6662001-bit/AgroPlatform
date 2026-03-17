using MediatR;

namespace AgroPlatform.Application.Fuel.Commands.CreateFuelSupply;

public record CreateFuelSupplyCommand(
    Guid FuelTankId,
    decimal QuantityLiters,
    decimal? PricePerLiter,
    DateTime TransactionDate,
    string? SupplierName,
    string? InvoiceNumber,
    string? Notes
) : IRequest<Guid>;
