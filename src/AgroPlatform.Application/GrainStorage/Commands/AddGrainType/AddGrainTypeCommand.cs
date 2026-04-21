using MediatR;

namespace AgroPlatform.Application.GrainStorage.Commands.AddGrainType;

public record AddGrainTypeCommand(string Name) : IRequest<Guid>;
