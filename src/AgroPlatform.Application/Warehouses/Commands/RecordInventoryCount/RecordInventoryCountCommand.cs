using MediatR;

namespace AgroPlatform.Application.Warehouses.Commands.RecordInventoryCount;

public record RecordInventoryCountCommand(
    Guid SessionId,
    Guid ItemId,
    Guid? BatchId,
    decimal ActualQuantity,
    string? Note
) : IRequest;
