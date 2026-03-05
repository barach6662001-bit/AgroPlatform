using MediatR;

namespace AgroPlatform.Application.AgroOperations.Commands.DeleteAgroOperation;

public record DeleteAgroOperationCommand(Guid Id) : IRequest;
