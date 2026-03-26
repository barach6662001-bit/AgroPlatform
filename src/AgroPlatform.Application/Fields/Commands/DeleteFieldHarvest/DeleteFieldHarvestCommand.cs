using MediatR;

namespace AgroPlatform.Application.Fields.Commands.DeleteFieldHarvest;

public record DeleteFieldHarvestCommand(Guid FieldId, Guid Id) : IRequest;
