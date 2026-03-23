using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Sales.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Sales.Queries.GetSalesAnalytics;

public class GetSalesAnalyticsHandler : IRequestHandler<GetSalesAnalyticsQuery, SalesAnalyticsDto>
{
    private readonly IAppDbContext _context;

    public GetSalesAnalyticsHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<SalesAnalyticsDto> Handle(GetSalesAnalyticsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Sales.AsQueryable();

        if (request.Year.HasValue)
            query = query.Where(s => s.Date.Year == request.Year.Value);

        var totalRevenue = await query.SumAsync(s => s.TotalAmount, cancellationToken);
        var totalCount = await query.CountAsync(cancellationToken);

        var byProduct = await query
            .GroupBy(s => s.Product)
            .Select(g => new ProductRevenueDto
            {
                Product = g.Key,
                TotalAmount = g.Sum(s => s.TotalAmount),
                TotalQuantity = g.Sum(s => s.Quantity),
            })
            .OrderByDescending(p => p.TotalAmount)
            .ToListAsync(cancellationToken);

        var byBuyer = await query
            .GroupBy(s => s.BuyerName)
            .Select(g => new BuyerRevenueDto
            {
                BuyerName = g.Key,
                TotalAmount = g.Sum(s => s.TotalAmount),
                SalesCount = g.Count(),
            })
            .OrderByDescending(b => b.TotalAmount)
            .ToListAsync(cancellationToken);

        var byMonth = await query
            .GroupBy(s => new { s.Date.Year, s.Date.Month })
            .Select(g => new MonthlyRevenueDto
            {
                Year = g.Key.Year,
                Month = g.Key.Month,
                TotalAmount = g.Sum(s => s.TotalAmount),
                SalesCount = g.Count(),
            })
            .OrderBy(m => m.Year).ThenBy(m => m.Month)
            .ToListAsync(cancellationToken);

        return new SalesAnalyticsDto
        {
            TotalRevenue = totalRevenue,
            TotalSalesCount = totalCount,
            ByProduct = byProduct,
            ByBuyer = byBuyer,
            ByMonth = byMonth,
        };
    }
}
