using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Fields;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Fields.Commands.UpdateLandLease;

public class UpdateLandLeaseHandler : IRequestHandler<UpdateLandLeaseCommand>
{
    private readonly IAppDbContext _context;

    public UpdateLandLeaseHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task Handle(UpdateLandLeaseCommand request, CancellationToken cancellationToken)
    {
        var lease = await _context.LandLeases
            .FirstOrDefaultAsync(l => l.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(LandLease), request.Id);

        lease.OwnerName = request.OwnerName;
        lease.OwnerPhone = request.OwnerPhone;
        lease.ContractNumber = request.ContractNumber;
        lease.AnnualPayment = request.AnnualPayment;
        lease.PaymentType = request.PaymentType;
        lease.GrainPaymentTons = request.GrainPaymentTons;
        lease.ContractEndDate = request.ContractEndDate;
        lease.Notes = request.Notes;
        lease.IsActive = request.IsActive;

        await _context.SaveChangesAsync(cancellationToken);
    }
}
