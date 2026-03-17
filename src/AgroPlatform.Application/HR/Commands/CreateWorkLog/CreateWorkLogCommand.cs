using MediatR;

namespace AgroPlatform.Application.HR.Commands.CreateWorkLog;

public record CreateWorkLogCommand(
    Guid EmployeeId,
    DateTime WorkDate,
    decimal? HoursWorked,
    decimal? UnitsProduced,
    string? WorkDescription,
    Guid? FieldId,
    Guid? OperationId
) : IRequest<Guid>;
