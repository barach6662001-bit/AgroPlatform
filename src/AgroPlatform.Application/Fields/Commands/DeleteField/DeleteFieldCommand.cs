using MediatR;

namespace AgroPlatform.Application.Fields.Commands.DeleteField;

public record DeleteFieldCommand(Guid Id) : IRequest;
