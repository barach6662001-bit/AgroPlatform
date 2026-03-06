using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Common.Models;
using AgroPlatform.Application.Fields.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Fields.Queries.GetFields;

public class GetFieldsHandler : IRequestHandler<GetFieldsQuery, PaginatedResult<FieldDto>>
{
    private readonly IAppDbContext _context;

    public GetFieldsHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<PaginatedResult<FieldDto>> Handle(GetFieldsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Fields.AsQueryable();

        if (request.CurrentCrop.HasValue)
            query = query.Where(f => f.CurrentCrop == request.CurrentCrop.Value);

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var term = request.SearchTerm.ToLower();
            query = query.Where(f =>
                f.Name.ToLower().Contains(term) ||
                (f.CadastralNumber != null && f.CadastralNumber.ToLower().Contains(term)));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderBy(f => f.Name)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(f => new FieldDto
            {
                Id = f.Id,
                Name = f.Name,
                CadastralNumber = f.CadastralNumber,
                AreaHectares = f.AreaHectares,
                CurrentCrop = f.CurrentCrop,
                CurrentCropYear = f.CurrentCropYear,
                SoilType = f.SoilType,
                Notes = f.Notes
            })
            .ToListAsync(cancellationToken);

        return new PaginatedResult<FieldDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = request.Page,
            PageSize = request.PageSize
        };
    }
}
