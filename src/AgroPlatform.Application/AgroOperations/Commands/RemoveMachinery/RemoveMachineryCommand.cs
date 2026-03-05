using MediatR;

namespace AgroPlatform.Application.AgroOperations.Commands.RemoveMachinery;

public record RemoveMachineryCommand(Guid MachineryId) : IRequest;
