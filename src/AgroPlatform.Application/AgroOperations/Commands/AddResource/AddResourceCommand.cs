using MediatR;

namespace AgroPlatform.Application.AgroOperations.Commands.AddResource;

public record AddResourceCommand(
    Guid AgroOperationId,
    Guid WarehouseItemId,
    Guid WarehouseId,
    decimal PlannedQuantity,
    string UnitCode
) : IRequest<Guid>;
