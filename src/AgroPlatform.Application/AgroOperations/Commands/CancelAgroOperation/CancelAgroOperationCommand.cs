using MediatR;

namespace AgroPlatform.Application.AgroOperations.Commands.CancelAgroOperation;

public record CancelAgroOperationCommand(Guid Id) : IRequest;
