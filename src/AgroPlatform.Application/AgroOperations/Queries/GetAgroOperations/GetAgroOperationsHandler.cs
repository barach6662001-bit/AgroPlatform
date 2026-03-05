using AgroPlatform.Application.AgroOperations.DTOs;
using AgroPlatform.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.AgroOperations.Queries.GetAgroOperations;

public class GetAgroOperationsHandler : IRequestHandler<GetAgroOperationsQuery, List<AgroOperationDto>>
{
    private readonly IAppDbContext _context;

    public GetAgroOperationsHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<List<AgroOperationDto>> Handle(GetAgroOperationsQuery request, CancellationToken cancellationToken)
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

        return await query
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
                AreaProcessed = o.AreaProcessed
            })
            .ToListAsync(cancellationToken);
    }
}
