using AgroPlatform.Application.Warehouses.DTOs;
using MediatR;

namespace AgroPlatform.Application.Warehouses.Queries.GetWarehouses;

public record GetWarehousesQuery() : IRequest<List<WarehouseDto>>;
