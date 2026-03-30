using MediatR;

namespace AgroPlatform.Application.Warehouses.Queries.GetInventorySessionById;

public record GetInventorySessionByIdQuery(Guid SessionId) : IRequest<InventorySessionDetailDto>;
