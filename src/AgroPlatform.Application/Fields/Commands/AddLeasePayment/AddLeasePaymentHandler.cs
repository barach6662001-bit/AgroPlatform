using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Fields;
using AgroPlatform.Domain.GrainStorage;
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
            PaymentMethod = request.PaymentMethod,
            PaymentDate = request.PaymentDate,
            GrainBatchId = request.GrainBatchId,
            GrainQuantityTons = request.GrainQuantityTons,
            GrainPricePerTon = request.GrainPricePerTon,
            Notes = request.Notes,
        };

        _context.LeasePayments.Add(payment);

        if (request.PaymentMethod == "Grain" && request.GrainBatchId.HasValue)
        {
            var batch = await _context.GrainBatches
                .FirstOrDefaultAsync(b => b.Id == request.GrainBatchId.Value, cancellationToken)
                ?? throw new NotFoundException(nameof(GrainBatch), request.GrainBatchId.Value);

            var qty = request.GrainQuantityTons
                ?? throw new ConflictException("GrainQuantityTons is required for grain payments.");

            if (batch.QuantityTons < qty)
                throw new ConflictException($"Insufficient grain in batch. Requested: {qty}, Available: {batch.QuantityTons}");

            var movement = new GrainMovement
            {
                GrainBatchId = batch.Id,
                MovementType = "Out",
                QuantityTons = qty,
                PricePerTon = request.GrainPricePerTon,
                TotalRevenue = qty * request.GrainPricePerTon,
                MovementDate = request.PaymentDate,
                Reason = $"Орендна плата — {payment.Year} рік",
                Notes = request.Notes,
            };
            _context.GrainMovements.Add(movement);

            batch.QuantityTons -= qty;
        }

        await _context.SaveChangesAsync(cancellationToken);
        return payment.Id;
    }
}
