using MediatR;

namespace AgroPlatform.Application.Economics.Commands.DeleteSale;

public record DeleteSaleCommand(Guid Id) : IRequest;
