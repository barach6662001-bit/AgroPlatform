using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.HR.DTOs;
using AgroPlatform.Domain.HR;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.HR.Commands.CreateWorkLog;

public class CreateWorkLogHandler : IRequestHandler<CreateWorkLogCommand, WorkLogDto>
{
    private readonly IAppDbContext _context;

    public CreateWorkLogHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<WorkLogDto> Handle(CreateWorkLogCommand request, CancellationToken cancellationToken)
    {
        var employee = await _context.Employees
            .FirstOrDefaultAsync(e => e.Id == request.EmployeeId, cancellationToken)
            ?? throw new NotFoundException(nameof(Employee), request.EmployeeId);

        // Автоматичний розрахунок AccruedAmount
        decimal accrued = 0;
        if (employee.SalaryType == "Hourly" && request.HoursWorked.HasValue && employee.HourlyRate.HasValue)
            accrued = request.HoursWorked.Value * employee.HourlyRate.Value;
        else if (employee.SalaryType == "Piecework" && request.UnitsProduced.HasValue && employee.PieceworkRate.HasValue)
            accrued = request.UnitsProduced.Value * employee.PieceworkRate.Value;

        var workLog = new WorkLog
        {
            EmployeeId = request.EmployeeId,
            WorkDate = request.WorkDate,
            HoursWorked = request.HoursWorked,
            UnitsProduced = request.UnitsProduced,
            WorkDescription = request.WorkDescription,
            FieldId = request.FieldId,
            OperationId = request.OperationId,
            AccruedAmount = accrued,
            IsPaid = false
        };

        _context.WorkLogs.Add(workLog);
        await _context.SaveChangesAsync(cancellationToken);

        return new WorkLogDto
        {
            Id = workLog.Id,
            EmployeeId = workLog.EmployeeId,
            EmployeeName = $"{employee.FirstName} {employee.LastName}",
            WorkDate = workLog.WorkDate,
            HoursWorked = workLog.HoursWorked,
            UnitsProduced = workLog.UnitsProduced,
            WorkDescription = workLog.WorkDescription,
            FieldId = workLog.FieldId,
            OperationId = workLog.OperationId,
            AccruedAmount = workLog.AccruedAmount,
            IsPaid = workLog.IsPaid
        };
    }
}
