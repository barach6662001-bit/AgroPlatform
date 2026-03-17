using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.HR.Commands.UpdateEmployee;

public class UpdateEmployeeHandler : IRequestHandler<UpdateEmployeeCommand>
{
    private readonly IAppDbContext _context;

    public UpdateEmployeeHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task Handle(UpdateEmployeeCommand request, CancellationToken cancellationToken)
    {
        var employee = await _context.Employees
            .FirstOrDefaultAsync(e => e.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException("Employee", request.Id);

        employee.FirstName = request.FirstName;
        employee.LastName = request.LastName;
        employee.Position = request.Position;
        employee.SalaryType = request.SalaryType;
        employee.HourlyRate = request.HourlyRate;
        employee.PieceworkRate = request.PieceworkRate;
        employee.Notes = request.Notes;
        employee.IsActive = request.IsActive;

        await _context.SaveChangesAsync(cancellationToken);
    }
}
