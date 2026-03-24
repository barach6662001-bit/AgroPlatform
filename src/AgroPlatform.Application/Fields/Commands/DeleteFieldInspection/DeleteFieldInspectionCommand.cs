using MediatR;

namespace AgroPlatform.Application.Fields.Commands.DeleteFieldInspection;

public record DeleteFieldInspectionCommand(Guid Id) : IRequest;
