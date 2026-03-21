using MediatR;

namespace AgroPlatform.Application.Sales.Commands.DeleteSale;

public record DeleteSaleCommand(Guid Id) : IRequest;
