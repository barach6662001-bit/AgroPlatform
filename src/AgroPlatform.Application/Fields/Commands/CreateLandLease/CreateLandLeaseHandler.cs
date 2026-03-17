using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Fields;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Fields.Commands.CreateLandLease;

public class CreateLandLeaseHandler : IRequestHandler<CreateLandLeaseCommand, Guid>
{
    private readonly IAppDbContext _context;

    public CreateLandLeaseHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateLandLeaseCommand request, CancellationToken cancellationToken)
    {
        var fieldExists = await _context.Fields
            .AnyAsync(f => f.Id == request.FieldId, cancellationToken);

        if (!fieldExists)
            throw new NotFoundException(nameof(Field), request.FieldId);

        var lease = new LandLease
        {
            FieldId = request.FieldId,
            OwnerName = request.OwnerName,
            OwnerPhone = request.OwnerPhone,
            ContractNumber = request.ContractNumber,
            AnnualPayment = request.AnnualPayment,
            PaymentType = request.PaymentType,
            GrainPaymentTons = request.GrainPaymentTons,
            ContractStartDate = request.ContractStartDate,
            ContractEndDate = request.ContractEndDate,
            Notes = request.Notes,
            IsActive = true,
        };

        _context.LandLeases.Add(lease);
        await _context.SaveChangesAsync(cancellationToken);
        return lease.Id;
    }
}
