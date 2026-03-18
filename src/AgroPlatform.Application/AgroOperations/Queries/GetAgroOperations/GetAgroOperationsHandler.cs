using AgroPlatform.Application.AgroOperations.DTOs;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Common.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.AgroOperations.Queries.GetAgroOperations;

public class GetAgroOperationsHandler : IRequestHandler<GetAgroOperationsQuery, PaginatedResult<AgroOperationDto>>
{
    private readonly IAppDbContext _context;

    public GetAgroOperationsHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<PaginatedResult<AgroOperationDto>> Handle(GetAgroOperationsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.AgroOperations
            .Include(o => o.Field)
            .AsQueryable();

        if (request.FieldId.HasValue)
            query = query.Where(o => o.FieldId == request.FieldId.Value);

        if (request.OperationType.HasValue)
            query = query.Where(o => o.OperationType == request.OperationType.Value);

        if (request.IsCompleted.HasValue)
            query = query.Where(o => o.IsCompleted == request.IsCompleted.Value);

        if (request.DateFrom.HasValue)
            query = query.Where(o => o.PlannedDate >= request.DateFrom.Value);

        if (request.DateTo.HasValue)
            query = query.Where(o => o.PlannedDate <= request.DateTo.Value);

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderBy(o => o.PlannedDate)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(o => new AgroOperationDto
            {
                Id = o.Id,
                FieldId = o.FieldId,
                FieldName = o.Field.Name,
                OperationType = o.OperationType,
                PlannedDate = o.PlannedDate,
                CompletedDate = o.CompletedDate,
                IsCompleted = o.IsCompleted,
                Description = o.Description,
                AreaProcessed = o.AreaProcessed,
                PerformedByEmployeeId = o.PerformedByEmployeeId,
                PerformedByName = o.PerformedByName,
            })
            .ToListAsync(cancellationToken);

        return new PaginatedResult<AgroOperationDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = request.Page,
            PageSize = request.PageSize
        };
    }
}
