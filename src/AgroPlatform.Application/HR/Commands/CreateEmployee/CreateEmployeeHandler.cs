using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.HR.DTOs;
using AgroPlatform.Domain.HR;
using MediatR;

namespace AgroPlatform.Application.HR.Commands.CreateEmployee;

public class CreateEmployeeHandler : IRequestHandler<CreateEmployeeCommand, EmployeeDto>
{
    private readonly IAppDbContext _context;

    public CreateEmployeeHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<EmployeeDto> Handle(CreateEmployeeCommand request, CancellationToken cancellationToken)
    {
        var employee = new Employee
        {
            FirstName = request.FirstName,
            LastName = request.LastName,
            Position = request.Position,
            SalaryType = request.SalaryType,
            HourlyRate = request.HourlyRate,
            PieceworkRate = request.PieceworkRate,
            Notes = request.Notes,
            IsActive = true
        };

        _context.Employees.Add(employee);
        await _context.SaveChangesAsync(cancellationToken);

        return new EmployeeDto
        {
            Id = employee.Id,
            FirstName = employee.FirstName,
            LastName = employee.LastName,
            Position = employee.Position,
            SalaryType = employee.SalaryType,
            HourlyRate = employee.HourlyRate,
            PieceworkRate = employee.PieceworkRate,
            IsActive = employee.IsActive,
            Notes = employee.Notes
        };
    }
}
