using MediatR;

namespace AgroPlatform.Application.HR.Commands.CreateEmployee;

public record CreateEmployeeCommand(
    string FirstName,
    string LastName,
    string? Position,
    string SalaryType,
    decimal? HourlyRate,
    decimal? PieceworkRate,
    string? Notes
) : IRequest<Guid>;
