using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Application.Fields.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Fields.Queries.GetSoilAnalyses;

public class GetSoilAnalysesHandler : IRequestHandler<GetSoilAnalysesQuery, List<SoilAnalysisDto>>
{
    private readonly IAppDbContext _context;

    public GetSoilAnalysesHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<List<SoilAnalysisDto>> Handle(GetSoilAnalysesQuery request, CancellationToken cancellationToken)
    {
        var query = _context.SoilAnalyses
            .Where(s => s.FieldId == request.FieldId);

        if (request.Year.HasValue)
            query = query.Where(s => s.Year == request.Year.Value);

        return await query
            .OrderByDescending(s => s.Year)
            .ThenByDescending(s => s.SampleDate)
            .Select(s => new SoilAnalysisDto
            {
                Id = s.Id,
                Year = s.Year,
                SampleDate = s.SampleDate,
                Ph = s.Ph,
                OrganicMatter = s.OrganicMatter,
                Nitrogen = s.Nitrogen,
                Phosphorus = s.Phosphorus,
                Potassium = s.Potassium,
                SampleDepthCm = s.SampleDepthCm,
                LabName = s.LabName,
                Notes = s.Notes,
            })
            .ToListAsync(cancellationToken);
    }
}
