using MediatR;

namespace AgroPlatform.Application.Fields.Commands.DeleteFieldZone;

public record DeleteFieldZoneCommand(Guid FieldId, Guid Id) : IRequest;
