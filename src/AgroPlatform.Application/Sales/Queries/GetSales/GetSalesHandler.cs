using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Common.Models;
using AgroPlatform.Application.Sales.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Sales.Queries.GetSales;

public class GetSalesHandler : IRequestHandler<GetSalesQuery, PaginatedResult<SaleDto>>
{
    private readonly IAppDbContext _context;

    public GetSalesHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<PaginatedResult<SaleDto>> Handle(GetSalesQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Sales.AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.BuyerName))
            query = query.Where(s => s.BuyerName.Contains(request.BuyerName));

        if (request.DateFrom.HasValue)
            query = query.Where(s => s.Date >= request.DateFrom.Value);

        if (request.DateTo.HasValue)
            query = query.Where(s => s.Date <= request.DateTo.Value);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(s => s.Date)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
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
            .ToListAsync(cancellationToken);

        return new PaginatedResult<SaleDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = request.Page,
            PageSize = request.PageSize
        };
    }
}
