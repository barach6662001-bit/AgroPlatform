using MediatR;

namespace AgroPlatform.Application.AgroOperations.Commands.RemoveResource;

public record RemoveResourceCommand(Guid ResourceId) : IRequest;
