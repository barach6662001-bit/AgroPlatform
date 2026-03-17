using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.HR;
using MediatR;

namespace AgroPlatform.Application.HR.Commands.CreateEmployee;

public class CreateEmployeeHandler : IRequestHandler<CreateEmployeeCommand, Guid>
{
    private readonly IAppDbContext _context;

    public CreateEmployeeHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateEmployeeCommand request, CancellationToken cancellationToken)
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
            IsActive = true,
        };

        _context.Employees.Add(employee);
        await _context.SaveChangesAsync(cancellationToken);
        return employee.Id;
    }
}
