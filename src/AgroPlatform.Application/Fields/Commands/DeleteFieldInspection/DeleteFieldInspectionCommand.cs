using MediatR;

namespace AgroPlatform.Application.Fields.Commands.DeleteFieldInspection;

public record DeleteFieldInspectionCommand(Guid FieldId, Guid Id) : IRequest;
