using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.HR.DTOs;
using AgroPlatform.Domain.Economics;
using AgroPlatform.Domain.HR;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.HR.Commands.CreateSalaryPayment;

public class CreateSalaryPaymentHandler : IRequestHandler<CreateSalaryPaymentCommand, SalaryPaymentDto>
{
    private readonly IAppDbContext _context;

    public CreateSalaryPaymentHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<SalaryPaymentDto> Handle(CreateSalaryPaymentCommand request, CancellationToken cancellationToken)
    {
        var employee = await _context.Employees
            .FirstOrDefaultAsync(e => e.Id == request.EmployeeId, cancellationToken)
            ?? throw new NotFoundException(nameof(Employee), request.EmployeeId);

        var payment = new SalaryPayment
        {
            EmployeeId = request.EmployeeId,
            Amount = request.Amount,
            PaymentDate = request.PaymentDate,
            PaymentType = request.PaymentType,
            Notes = request.Notes
        };

        _context.SalaryPayments.Add(payment);

        // Виплата автоматично йде у витрати
        var costRecord = new CostRecord
        {
            Category = "Labor",
            Amount = request.Amount,
            Currency = "UAH",
            Date = request.PaymentDate,
            Description = $"Зарплата: {employee.FirstName} {employee.LastName} ({request.PaymentType})"
        };
        _context.CostRecords.Add(costRecord);

        await _context.SaveChangesAsync(cancellationToken);

        return new SalaryPaymentDto
        {
            Id = payment.Id,
            EmployeeId = payment.EmployeeId,
            EmployeeName = $"{employee.FirstName} {employee.LastName}",
            Amount = payment.Amount,
            PaymentDate = payment.PaymentDate,
            PaymentType = payment.PaymentType,
            Notes = payment.Notes
        };
    }
}
