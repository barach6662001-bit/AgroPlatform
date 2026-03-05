using MediatR;

namespace AgroPlatform.Application.Machinery.Commands.DeleteMachine;

public record DeleteMachineCommand(Guid Id) : IRequest;
