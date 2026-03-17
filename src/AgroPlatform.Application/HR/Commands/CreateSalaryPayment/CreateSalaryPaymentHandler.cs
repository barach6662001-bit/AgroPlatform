using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Economics;
using AgroPlatform.Domain.HR;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.HR.Commands.CreateSalaryPayment;

public class CreateSalaryPaymentHandler : IRequestHandler<CreateSalaryPaymentCommand, Guid>
{
    private readonly IAppDbContext _context;

    public CreateSalaryPaymentHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateSalaryPaymentCommand request, CancellationToken cancellationToken)
    {
        var employeeExists = await _context.Employees
            .AnyAsync(e => e.Id == request.EmployeeId, cancellationToken);

        if (!employeeExists)
            throw new NotFoundException(nameof(Employee), request.EmployeeId);

        var payment = new SalaryPayment
        {
            EmployeeId = request.EmployeeId,
            Amount = request.Amount,
            PaymentDate = request.PaymentDate,
            PaymentType = request.PaymentType,
            Notes = request.Notes,
        };

        _context.SalaryPayments.Add(payment);

        // Automatically create a cost record when salary is paid
        var costRecord = new CostRecord
        {
            Category = "Salary",
            Amount = request.Amount,
            Currency = "UAH",
            Date = request.PaymentDate,
            Description = $"{request.PaymentType}: employee {request.EmployeeId}{(request.Notes != null ? " — " + request.Notes : "")}",
        };

        _context.CostRecords.Add(costRecord);

        await _context.SaveChangesAsync(cancellationToken);
        return payment.Id;
    }
}
