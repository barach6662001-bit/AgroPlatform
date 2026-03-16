using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Common.Models;
using AgroPlatform.Application.Fuel.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Fuel.Queries.GetFuelTransactions;

public class GetFuelTransactionsHandler : IRequestHandler<GetFuelTransactionsQuery, PaginatedResult<FuelTransactionDto>>
{
    private readonly IAppDbContext _context;

    public GetFuelTransactionsHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<PaginatedResult<FuelTransactionDto>> Handle(
        GetFuelTransactionsQuery request,
        CancellationToken cancellationToken)
    {
        var query = _context.FuelTransactions
            .AsNoTracking()
            .Include(t => t.FuelTank)
            .AsQueryable();

        if (request.TankId.HasValue)
            query = query.Where(t => t.FuelTankId == request.TankId.Value);

        if (request.DateFrom.HasValue)
            query = query.Where(t => t.TransactionDate >= request.DateFrom.Value);

        if (request.DateTo.HasValue)
            query = query.Where(t => t.TransactionDate <= request.DateTo.Value);

        var total = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(t => t.TransactionDate)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(t => new FuelTransactionDto
            {
                Id = t.Id,
                FuelTankId = t.FuelTankId,
                TankName = t.FuelTank.Name,
                TransactionType = t.TransactionType,
                QuantityLiters = t.QuantityLiters,
                PricePerLiter = t.PricePerLiter,
                TotalCost = t.TotalCost,
                TransactionDate = t.TransactionDate,
                MachineId = t.MachineId,
                DriverName = t.DriverName,
                SupplierName = t.SupplierName,
                InvoiceNumber = t.InvoiceNumber,
                Notes = t.Notes,
            })
            .ToListAsync(cancellationToken);

        return new PaginatedResult<FuelTransactionDto>
        {
            Items = items,
            TotalCount = total,
            Page = request.Page,
            PageSize = request.PageSize,
        };
    }
}
