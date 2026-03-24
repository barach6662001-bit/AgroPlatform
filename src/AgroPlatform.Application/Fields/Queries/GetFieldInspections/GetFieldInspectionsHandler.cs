using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Fields.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Fields.Queries.GetFieldInspections;

public class GetFieldInspectionsHandler : IRequestHandler<GetFieldInspectionsQuery, List<FieldInspectionDto>>
{
    private readonly IAppDbContext _context;

    public GetFieldInspectionsHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<List<FieldInspectionDto>> Handle(GetFieldInspectionsQuery request, CancellationToken cancellationToken)
    {
        return await _context.FieldInspections
            .Where(i => i.FieldId == request.FieldId)
            .OrderByDescending(i => i.Date)
            .Select(i => new FieldInspectionDto
            {
                Id = i.Id,
                Date = i.Date,
                InspectorName = i.InspectorName,
                Notes = i.Notes,
                Severity = i.Severity,
                Latitude = i.Latitude,
                Longitude = i.Longitude,
                PhotoUrl = i.PhotoUrl,
            })
            .ToListAsync(cancellationToken);
    }
}
