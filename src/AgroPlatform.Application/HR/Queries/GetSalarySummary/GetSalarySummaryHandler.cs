using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.HR.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.HR.Queries.GetSalarySummary;

public class GetSalarySummaryHandler : IRequestHandler<GetSalarySummaryQuery, List<SalarySummaryDto>>
{
    private readonly IAppDbContext _context;

    public GetSalarySummaryHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<List<SalarySummaryDto>> Handle(GetSalarySummaryQuery request, CancellationToken cancellationToken)
    {
        var employees = await _context.Employees
            .Where(e => e.IsActive)
            .OrderBy(e => e.LastName)
            .ThenBy(e => e.FirstName)
            .ToListAsync(cancellationToken);

        var accruals = await _context.WorkLogs
            .Where(w => w.WorkDate.Month == request.Month && w.WorkDate.Year == request.Year)
            .GroupBy(w => w.EmployeeId)
            .Select(g => new { EmployeeId = g.Key, Total = g.Sum(w => w.AccruedAmount) })
            .ToListAsync(cancellationToken);

        var payments = await _context.SalaryPayments
            .Where(p => p.PaymentDate.Month == request.Month && p.PaymentDate.Year == request.Year)
            .GroupBy(p => p.EmployeeId)
            .Select(g => new { EmployeeId = g.Key, Total = g.Sum(p => p.Amount) })
            .ToListAsync(cancellationToken);

        var accrualMap = accruals.ToDictionary(a => a.EmployeeId, a => a.Total);
        var paymentMap = payments.ToDictionary(p => p.EmployeeId, p => p.Total);

        return employees.Select(e =>
        {
            var totalAccrued = accrualMap.GetValueOrDefault(e.Id, 0);
            var totalPaid = paymentMap.GetValueOrDefault(e.Id, 0);
            return new SalarySummaryDto
            {
                EmployeeId = e.Id,
                EmployeeFullName = e.LastName + " " + e.FirstName,
                Position = e.Position,
                TotalAccrued = totalAccrued,
                TotalPaid = totalPaid,
                Debt = totalAccrued - totalPaid,
            };
        }).ToList();
    }
}
