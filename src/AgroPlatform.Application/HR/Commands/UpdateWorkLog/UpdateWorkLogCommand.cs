using MediatR;

namespace AgroPlatform.Application.HR.Commands.UpdateWorkLog;

public record UpdateWorkLogCommand(
    Guid Id,
    DateTime WorkDate,
    decimal? HoursWorked,
    decimal? UnitsProduced,
    string? WorkDescription,
    Guid? FieldId,
    Guid? OperationId
) : IRequest;
