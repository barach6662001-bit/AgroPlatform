using MediatR;

namespace AgroPlatform.Application.Fields.Commands.DeleteFieldProtection;

public record DeleteFieldProtectionCommand(Guid Id) : IRequest;
