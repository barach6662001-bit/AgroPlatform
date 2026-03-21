using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Economics;
using AgroPlatform.Domain.Fields;
using AgroPlatform.Domain.GrainStorage;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Fields.Commands.AddLeasePayment;

public class AddLeasePaymentHandler : IRequestHandler<AddLeasePaymentCommand, Guid>
{
    private readonly IAppDbContext _context;
    private readonly INotificationService _notifications;
    private readonly ICurrentUserService _currentUser;

    public AddLeasePaymentHandler(IAppDbContext context, INotificationService notifications, ICurrentUserService currentUser)
    {
        _context = context;
        _notifications = notifications;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(AddLeasePaymentCommand request, CancellationToken cancellationToken)
    {
        var leaseForCheck = await _context.LandLeases
            .FirstOrDefaultAsync(l => l.Id == request.LandLeaseId, cancellationToken);

        if (leaseForCheck == null)
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

        // Auto-create cost record for lease payment
        var costAmount = request.PaymentMethod == "Grain"
            && request.GrainQuantityTons.HasValue
            && request.GrainPricePerTon.HasValue
                ? Math.Round(request.GrainQuantityTons.Value * request.GrainPricePerTon.Value, 2)
                : request.Amount;

        _context.CostRecords.Add(new CostRecord
        {
            Category = "Lease",
            Amount = costAmount,
            Currency = "UAH",
            Date = request.PaymentDate,
            FieldId = leaseForCheck.FieldId,
            Description = request.PaymentMethod == "Grain"
                ? $"Оренда (зерно): {request.GrainQuantityTons:F2}т × {request.GrainPricePerTon:F0} UAH/т"
                : $"Оренда: {costAmount:F2} UAH ({request.PaymentType})"
        });

        await _context.SaveChangesAsync(cancellationToken);

        var lease = leaseForCheck;
        if (lease != null)
        {
            var totalPaidThisYear = await _context.LeasePayments
                .Where(p => p.LandLeaseId == request.LandLeaseId && p.Year == request.Year && !p.IsDeleted)
                .SumAsync(p => p.Amount, cancellationToken);

            if (totalPaidThisYear >= lease.AnnualPayment)
            {
                var field = await _context.Fields.FindAsync(new object[] { lease.FieldId }, cancellationToken);
                await _notifications.SendAsync(
                    _currentUser.TenantId, "success", "Оренду повністю сплачено",
                    $"Договір поля '{field?.Name ?? ""}' за {request.Year} рік — сплачено ({totalPaidThisYear:N0} ₴)",
                    cancellationToken);
            }
        }

        return payment.Id;
    }
}
