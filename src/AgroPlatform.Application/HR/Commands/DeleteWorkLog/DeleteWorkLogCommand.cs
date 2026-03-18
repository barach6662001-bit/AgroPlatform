using MediatR;

namespace AgroPlatform.Application.HR.Commands.DeleteWorkLog;

public record DeleteWorkLogCommand(Guid Id) : IRequest;
