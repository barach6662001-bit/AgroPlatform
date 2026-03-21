using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Fields;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Fields.Commands.UpdateSoilAnalysis;

public class UpdateSoilAnalysisHandler : IRequestHandler<UpdateSoilAnalysisCommand>
{
    private readonly IAppDbContext _context;

    public UpdateSoilAnalysisHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task Handle(UpdateSoilAnalysisCommand request, CancellationToken cancellationToken)
    {
        var analysis = await _context.SoilAnalyses
            .FirstOrDefaultAsync(s => s.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(SoilAnalysis), request.Id);

        analysis.ZoneId = request.ZoneId;
        analysis.SampleDate = request.SampleDate;
        analysis.pH = request.pH;
        analysis.Nitrogen = request.Nitrogen;
        analysis.Phosphorus = request.Phosphorus;
        analysis.Potassium = request.Potassium;
        analysis.Humus = request.Humus;
        analysis.Notes = request.Notes;

        await _context.SaveChangesAsync(cancellationToken);
    }
}
