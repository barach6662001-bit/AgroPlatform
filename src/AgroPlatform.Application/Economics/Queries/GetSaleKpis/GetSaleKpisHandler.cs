using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Economics.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Economics.Queries.GetSaleKpis;

public class GetSaleKpisHandler : IRequestHandler<GetSaleKpisQuery, SaleKpiDto>
{
    private readonly IAppDbContext _context;

    public GetSaleKpisHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<SaleKpiDto> Handle(GetSaleKpisQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Sales.AsQueryable();

        if (request.DateFrom.HasValue)
            query = query.Where(s => s.SaleDate >= request.DateFrom.Value);

        if (request.DateTo.HasValue)
            query = query.Where(s => s.SaleDate <= request.DateTo.Value);

        var sales = await query
            .Select(s => new { s.BuyerName, s.TotalAmount, s.QuantityTons, s.PricePerTon })
            .ToListAsync(cancellationToken);

        if (sales.Count == 0)
        {
            return new SaleKpiDto
            {
                TotalRevenue = 0,
                AveragePricePerTon = 0,
                TopBuyer = null,
                TopBuyerRevenue = 0,
                TotalSalesCount = 0,
                TotalQuantityTons = 0,
            };
        }

        var totalRevenue = sales.Sum(s => s.TotalAmount);
        var totalQuantity = sales.Sum(s => s.QuantityTons);
        var avgPrice = totalQuantity > 0
            ? sales.Sum(s => s.PricePerTon * s.QuantityTons) / totalQuantity
            : 0;

        var topBuyerGroup = sales
            .GroupBy(s => s.BuyerName)
            .Select(g => new { BuyerName = g.Key, Revenue = g.Sum(s => s.TotalAmount) })
            .OrderByDescending(g => g.Revenue)
            .FirstOrDefault();

        return new SaleKpiDto
        {
            TotalRevenue = totalRevenue,
            AveragePricePerTon = Math.Round(avgPrice, 2),
            TopBuyer = topBuyerGroup?.BuyerName,
            TopBuyerRevenue = topBuyerGroup?.Revenue ?? 0,
            TotalSalesCount = sales.Count,
            TotalQuantityTons = totalQuantity,
        };
    }
}
