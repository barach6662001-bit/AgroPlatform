using MediatR;

namespace AgroPlatform.Application.Fields.Commands.DeleteFieldFertilizer;

public record DeleteFieldFertilizerCommand(Guid Id) : IRequest;
