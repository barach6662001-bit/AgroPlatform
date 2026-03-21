using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Sales.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Sales.Queries.GetSaleById;

public class GetSaleByIdHandler : IRequestHandler<GetSaleByIdQuery, SaleDto?>
{
    private readonly IAppDbContext _context;

    public GetSaleByIdHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<SaleDto?> Handle(GetSaleByIdQuery request, CancellationToken cancellationToken)
    {
        return await _context.Sales
            .Where(s => s.Id == request.Id)
            .Select(s => new SaleDto
            {
                Id = s.Id,
                Date = s.Date,
                BuyerName = s.BuyerName,
                Product = s.Product,
                Quantity = s.Quantity,
                Unit = s.Unit,
                PricePerUnit = s.PricePerUnit,
                TotalAmount = s.TotalAmount,
                Currency = s.Currency,
                FieldId = s.FieldId,
                Notes = s.Notes
            })
            .FirstOrDefaultAsync(cancellationToken);
    }
}
