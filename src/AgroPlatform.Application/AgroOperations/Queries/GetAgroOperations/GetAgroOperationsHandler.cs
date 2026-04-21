using AgroPlatform.Application.AgroOperations.DTOs;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Common.Models;
using AgroPlatform.Domain.Enums;
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

        if (request.Status.HasValue)
            query = query.Where(o => o.Status == request.Status.Value);
        else if (request.IsCompleted.HasValue)
        {
            if (request.IsCompleted.Value)
                query = query.Where(o => o.Status == OperationStatus.Completed);
            else
                query = query.Where(o => o.Status != OperationStatus.Completed);
        }

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
                Status = o.Status,
                PlannedDate = o.PlannedDate,
                CompletedDate = o.CompletedDate,
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
