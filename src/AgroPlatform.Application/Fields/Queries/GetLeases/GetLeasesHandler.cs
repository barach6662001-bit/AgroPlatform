using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Fields.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Fields.Queries.GetLeases;

public class GetLeasesHandler : IRequestHandler<GetLeasesQuery, List<LandLeaseDto>>
{
    private readonly IAppDbContext _context;

    public GetLeasesHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<List<LandLeaseDto>> Handle(GetLeasesQuery request, CancellationToken cancellationToken)
    {
        var query = _context.LandLeases
            .Include(l => l.Field)
            .AsQueryable();

        if (request.FieldId.HasValue)
            query = query.Where(l => l.FieldId == request.FieldId.Value);

        return await query
            .OrderBy(l => l.Field.Name)
            .ThenBy(l => l.OwnerName)
            .Select(l => new LandLeaseDto
            {
                Id = l.Id,
                FieldId = l.FieldId,
                FieldName = l.Field.Name,
                OwnerName = l.OwnerName,
                OwnerPhone = l.OwnerPhone,
                ContractNumber = l.ContractNumber,
                AnnualPayment = l.AnnualPayment,
                PaymentType = l.PaymentType,
                GrainPaymentTons = l.GrainPaymentTons,
                IsActive = l.IsActive,
                ContractStartDate = l.ContractStartDate,
                ContractEndDate = l.ContractEndDate,
                Notes = l.Notes,
            })
            .ToListAsync(cancellationToken);
    }
}
