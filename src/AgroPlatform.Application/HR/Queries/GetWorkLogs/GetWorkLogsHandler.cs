using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.HR.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.HR.Queries.GetWorkLogs;

public class GetWorkLogsHandler : IRequestHandler<GetWorkLogsQuery, List<WorkLogDto>>
{
    private readonly IAppDbContext _context;

    public GetWorkLogsHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<List<WorkLogDto>> Handle(GetWorkLogsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.WorkLogs
            .Include(w => w.Employee)
            .AsQueryable();

        if (request.EmployeeId.HasValue)
            query = query.Where(w => w.EmployeeId == request.EmployeeId.Value);

        if (request.Month.HasValue)
            query = query.Where(w => w.WorkDate.Month == request.Month.Value);

        if (request.Year.HasValue)
            query = query.Where(w => w.WorkDate.Year == request.Year.Value);

        return await query
            .OrderBy(w => w.WorkDate)
            .ThenBy(w => w.Employee.LastName)
            .Select(w => new WorkLogDto
            {
                Id = w.Id,
                EmployeeId = w.EmployeeId,
                EmployeeFullName = w.Employee.LastName + " " + w.Employee.FirstName,
                WorkDate = w.WorkDate,
                HoursWorked = w.HoursWorked,
                UnitsProduced = w.UnitsProduced,
                WorkDescription = w.WorkDescription,
                FieldId = w.FieldId,
                OperationId = w.OperationId,
                AccruedAmount = w.AccruedAmount,
                IsPaid = w.IsPaid,
            })
            .ToListAsync(cancellationToken);
    }
}
