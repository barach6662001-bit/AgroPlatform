using AgroPlatform.Application.Common.Models;
using AgroPlatform.Application.Warehouses.DTOs;
using MediatR;

namespace AgroPlatform.Application.Warehouses.Queries.GetWarehouses;

public record GetWarehousesQuery(int Page = 1, int PageSize = 20) : IRequest<PaginatedResult<WarehouseDto>>;
