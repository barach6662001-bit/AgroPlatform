using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.HR.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.HR.Queries.GetEmployees;

public class GetEmployeesHandler : IRequestHandler<GetEmployeesQuery, IReadOnlyList<EmployeeDto>>
{
    private readonly IAppDbContext _context;

    public GetEmployeesHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<EmployeeDto>> Handle(GetEmployeesQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Employees.AsQueryable();

        if (request.ActiveOnly.HasValue)
            query = query.Where(e => e.IsActive == request.ActiveOnly.Value);

        return await query
            .OrderBy(e => e.LastName).ThenBy(e => e.FirstName)
            .Select(e => new EmployeeDto
            {
                Id = e.Id,
                FirstName = e.FirstName,
                LastName = e.LastName,
                Position = e.Position,
                SalaryType = e.SalaryType,
                HourlyRate = e.HourlyRate,
                PieceworkRate = e.PieceworkRate,
                IsActive = e.IsActive,
                Notes = e.Notes
            })
            .ToListAsync(cancellationToken);
    }
}
