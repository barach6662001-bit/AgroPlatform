using MediatR;

namespace AgroPlatform.Application.GrainStorage.Commands.DeleteGrainStorage;

public record DeleteGrainStorageCommand(Guid Id) : IRequest;
