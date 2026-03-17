using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Fields;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Fields.Commands.AddLeasePayment;

public class AddLeasePaymentHandler : IRequestHandler<AddLeasePaymentCommand, Guid>
{
    private readonly IAppDbContext _context;

    public AddLeasePaymentHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(AddLeasePaymentCommand request, CancellationToken cancellationToken)
    {
        var leaseExists = await _context.LandLeases
            .AnyAsync(l => l.Id == request.LandLeaseId, cancellationToken);

        if (!leaseExists)
            throw new NotFoundException(nameof(LandLease), request.LandLeaseId);

        var payment = new LeasePayment
        {
            LandLeaseId = request.LandLeaseId,
            Year = request.Year,
            Amount = request.Amount,
            PaymentType = request.PaymentType,
            PaymentDate = request.PaymentDate,
            Notes = request.Notes,
        };

        _context.LeasePayments.Add(payment);
        await _context.SaveChangesAsync(cancellationToken);
        return payment.Id;
    }
}
