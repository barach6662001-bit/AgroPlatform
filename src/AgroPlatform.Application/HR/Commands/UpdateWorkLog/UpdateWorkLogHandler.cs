using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.HR.Commands.UpdateWorkLog;

public class UpdateWorkLogHandler : IRequestHandler<UpdateWorkLogCommand>
{
    private readonly IAppDbContext _context;

    public UpdateWorkLogHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task Handle(UpdateWorkLogCommand request, CancellationToken cancellationToken)
    {
        var workLog = await _context.WorkLogs
            .FirstOrDefaultAsync(w => w.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException("WorkLog", request.Id);

        workLog.WorkDate = request.WorkDate;
        workLog.HoursWorked = request.HoursWorked;
        workLog.UnitsProduced = request.UnitsProduced;
        workLog.WorkDescription = request.WorkDescription;
        workLog.FieldId = request.FieldId;
        workLog.OperationId = request.OperationId;

        var employee = await _context.Employees.FindAsync(new object[] { workLog.EmployeeId }, cancellationToken);
        if (employee?.SalaryType == "Hourly" && request.HoursWorked.HasValue && employee.HourlyRate.HasValue)
            workLog.AccruedAmount = request.HoursWorked.Value * employee.HourlyRate.Value;
        else if (employee?.SalaryType == "Piecework" && request.UnitsProduced.HasValue && employee.PieceworkRate.HasValue)
            workLog.AccruedAmount = request.UnitsProduced.Value * employee.PieceworkRate.Value;

        await _context.SaveChangesAsync(cancellationToken);
    }
}
