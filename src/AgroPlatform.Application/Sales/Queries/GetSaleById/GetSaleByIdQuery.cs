using AgroPlatform.Application.Sales.DTOs;
using MediatR;

namespace AgroPlatform.Application.Sales.Queries.GetSaleById;

public record GetSaleByIdQuery(Guid Id) : IRequest<SaleDto?>;
