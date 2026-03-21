using MediatR;

namespace AgroPlatform.Application.Fields.Commands.DeleteFieldZone;

public record DeleteFieldZoneCommand(Guid Id) : IRequest;
