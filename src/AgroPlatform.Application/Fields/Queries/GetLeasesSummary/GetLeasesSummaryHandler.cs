using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Fields.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Fields.Queries.GetLeasesSummary;

public class GetLeasesSummaryHandler : IRequestHandler<GetLeasesSummaryQuery, List<LeaseSummaryDto>>
{
    private readonly IAppDbContext _context;

    public GetLeasesSummaryHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<List<LeaseSummaryDto>> Handle(GetLeasesSummaryQuery request, CancellationToken cancellationToken)
    {
        var leases = await _context.LandLeases
            .Include(l => l.Field)
            .Include(l => l.Payments.Where(p => p.Year == request.Year))
            .Where(l => l.IsActive)
            .OrderBy(l => l.Field.Name)
            .ToListAsync(cancellationToken);

        return leases.Select(l =>
        {
            var advance = l.Payments
                .Where(p => p.PaymentType == "Advance")
                .Sum(p => p.Amount);
            var total = l.Payments.Sum(p => p.Amount);
            var remaining = l.AnnualPayment - total;

            string status;
            if (total <= 0)
                status = "Unpaid";
            else if (total >= l.AnnualPayment)
                status = total > l.AnnualPayment ? "Overpaid" : "Paid";
            else
                status = "Partial";

            return new LeaseSummaryDto
            {
                LandLeaseId = l.Id,
                FieldName = l.Field.Name,
                OwnerName = l.OwnerName,
                AnnualPayment = l.AnnualPayment,
                AdvancePaid = advance,
                TotalPaid = total,
                Remaining = remaining,
                Status = status,
                Payments = l.Payments.Select(p => new LeasePaymentDto
                {
                    Id = p.Id,
                    LandLeaseId = p.LandLeaseId,
                    Year = p.Year,
                    Amount = p.Amount,
                    PaymentType = p.PaymentType,
                    PaymentMethod = p.PaymentMethod,
                    PaymentDate = p.PaymentDate,
                    Notes = p.Notes,
                }).ToList(),
            };
        }).ToList();
    }
}
