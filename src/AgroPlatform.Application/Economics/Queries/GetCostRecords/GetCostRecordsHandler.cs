using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Common.Models;
using AgroPlatform.Application.Economics.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Economics.Queries.GetCostRecords;

public class GetCostRecordsHandler : IRequestHandler<GetCostRecordsQuery, PaginatedResult<CostRecordDto>>
{
    private readonly IAppDbContext _context;

    public GetCostRecordsHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<PaginatedResult<CostRecordDto>> Handle(GetCostRecordsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.CostRecords.AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Category))
            query = query.Where(c => c.Category == request.Category);

        if (request.FieldId.HasValue)
            query = query.Where(c => c.FieldId == request.FieldId.Value);

        if (request.AgroOperationId.HasValue)
            query = query.Where(c => c.AgroOperationId == request.AgroOperationId.Value);

        if (request.DateFrom.HasValue)
            query = query.Where(c => c.Date >= request.DateFrom.Value);

        if (request.DateTo.HasValue)
            query = query.Where(c => c.Date <= request.DateTo.Value);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(c => c.Date)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(c => new CostRecordDto
            {
                Id = c.Id,
                Category = c.Category,
                Amount = c.Amount,
                Currency = c.Currency,
                Date = c.Date,
                FieldId = c.FieldId,
                AgroOperationId = c.AgroOperationId,
                Description = c.Description
            })
            .ToListAsync(cancellationToken);

        return new PaginatedResult<CostRecordDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = request.Page,
            PageSize = request.PageSize
        };
    }
}
