using MediatR;

namespace AgroPlatform.Application.HR.Commands.DeleteEmployee;

public record DeleteEmployeeCommand(Guid Id) : IRequest;
