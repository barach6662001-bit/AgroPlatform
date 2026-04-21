using MediatR;

namespace AgroPlatform.Application.Fields.Commands.DeleteFieldFertilizer;

public record DeleteFieldFertilizerCommand(Guid FieldId, Guid Id) : IRequest;
