using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.HR.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.HR.Queries.GetSalarySummary;

public class GetSalarySummaryHandler : IRequestHandler<GetSalarySummaryQuery, SalarySummaryDto>
{
    private readonly IAppDbContext _context;

    public GetSalarySummaryHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<SalarySummaryDto> Handle(GetSalarySummaryQuery request, CancellationToken cancellationToken)
    {
        var employees = await _context.Employees
            .Where(e => e.IsActive)
            .OrderBy(e => e.LastName).ThenBy(e => e.FirstName)
            .ToListAsync(cancellationToken);

        var worklogs = await _context.WorkLogs
            .Where(w => w.WorkDate.Month == request.Month && w.WorkDate.Year == request.Year)
            .ToListAsync(cancellationToken);

        var payments = await _context.SalaryPayments
            .Where(p => p.PaymentDate.Month == request.Month && p.PaymentDate.Year == request.Year)
            .ToListAsync(cancellationToken);

        var items = employees.Select(e => new SalarySummaryItemDto
        {
            EmployeeId = e.Id,
            EmployeeName = $"{e.FirstName} {e.LastName}",
            TotalAccrued = worklogs.Where(w => w.EmployeeId == e.Id).Sum(w => w.AccruedAmount),
            TotalPaid = payments.Where(p => p.EmployeeId == e.Id).Sum(p => p.Amount)
        }).ToList();

        return new SalarySummaryDto
        {
            Month = request.Month,
            Year = request.Year,
            Items = items
        };
    }
}
