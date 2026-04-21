using MediatR;

namespace AgroPlatform.Application.AgroOperations.Commands.UpdateResourceActual;

public record UpdateResourceActualCommand(Guid ResourceId, decimal ActualQuantity) : IRequest;
