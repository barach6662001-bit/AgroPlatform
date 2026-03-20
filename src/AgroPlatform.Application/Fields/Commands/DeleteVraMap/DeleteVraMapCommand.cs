using MediatR;

namespace AgroPlatform.Application.Fields.Commands.DeleteVraMap;

public record DeleteVraMapCommand(Guid Id) : IRequest;
