using MediatR;

namespace AgroPlatform.Application.HR.Commands.UpdateEmployee;

public record UpdateEmployeeCommand(
    Guid Id,
    string FirstName,
    string LastName,
    string? Position,
    string SalaryType,
    decimal? HourlyRate,
    decimal? PieceworkRate,
    string? Notes,
    bool IsActive
) : IRequest;
