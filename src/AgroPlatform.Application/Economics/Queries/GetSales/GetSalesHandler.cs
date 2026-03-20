using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Common.Models;
using AgroPlatform.Application.Economics.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Economics.Queries.GetSales;

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

        if (request.CropType.HasValue)
            query = query.Where(s => s.CropType == request.CropType.Value);

        if (request.PaymentStatus.HasValue)
            query = query.Where(s => s.PaymentStatus == request.PaymentStatus.Value);

        if (request.DateFrom.HasValue)
            query = query.Where(s => s.SaleDate >= request.DateFrom.Value);

        if (request.DateTo.HasValue)
            query = query.Where(s => s.SaleDate <= request.DateTo.Value);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(s => s.SaleDate)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(s => new SaleDto
            {
                Id = s.Id,
                BuyerName = s.BuyerName,
                ContractNumber = s.ContractNumber,
                CropType = s.CropType,
                QuantityTons = s.QuantityTons,
                PricePerTon = s.PricePerTon,
                TotalAmount = s.TotalAmount,
                SaleDate = s.SaleDate,
                PaymentStatus = s.PaymentStatus,
                GrainBatchId = s.GrainBatchId,
            })
            .ToListAsync(cancellationToken);

        return new PaginatedResult<SaleDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = request.Page,
            PageSize = request.PageSize,
        };
    }
}
