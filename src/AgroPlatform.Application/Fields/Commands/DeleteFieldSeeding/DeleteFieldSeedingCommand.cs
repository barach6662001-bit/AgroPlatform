using MediatR;

namespace AgroPlatform.Application.Fields.Commands.DeleteFieldSeeding;

public record DeleteFieldSeedingCommand(Guid Id) : IRequest;
