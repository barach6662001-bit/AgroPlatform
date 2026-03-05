using MediatR;

namespace AgroPlatform.Application.Economics.Commands.DeleteCostRecord;

public record DeleteCostRecordCommand(Guid Id) : IRequest;
