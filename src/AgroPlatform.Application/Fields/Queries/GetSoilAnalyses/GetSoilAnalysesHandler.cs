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
        return await _context.SoilAnalyses
            .Where(s => s.FieldId == request.FieldId)
            .OrderByDescending(s => s.SampleDate)
            .Select(s => new SoilAnalysisDto
            {
                Id = s.Id,
                ZoneId = s.ZoneId,
                SampleDate = s.SampleDate,
                pH = s.pH,
                Nitrogen = s.Nitrogen,
                Phosphorus = s.Phosphorus,
                Potassium = s.Potassium,
                Humus = s.Humus,
                Notes = s.Notes,
            })
            .ToListAsync(cancellationToken);
    }
}
