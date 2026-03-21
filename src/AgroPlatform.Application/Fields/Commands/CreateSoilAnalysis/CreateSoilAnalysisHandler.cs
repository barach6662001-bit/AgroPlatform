using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Fields;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Fields.Commands.CreateSoilAnalysis;

public class CreateSoilAnalysisHandler : IRequestHandler<CreateSoilAnalysisCommand, Guid>
{
    private readonly IAppDbContext _context;

    public CreateSoilAnalysisHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateSoilAnalysisCommand request, CancellationToken cancellationToken)
    {
        var fieldExists = await _context.Fields
            .AnyAsync(f => f.Id == request.FieldId, cancellationToken);

        if (!fieldExists)
            throw new NotFoundException(nameof(Field), request.FieldId);

        var analysis = new SoilAnalysis
        {
            FieldId = request.FieldId,
            ZoneId = request.ZoneId,
            SampleDate = request.SampleDate,
            pH = request.pH,
            Nitrogen = request.Nitrogen,
            Phosphorus = request.Phosphorus,
            Potassium = request.Potassium,
            Humus = request.Humus,
            Notes = request.Notes,
        };

        _context.SoilAnalyses.Add(analysis);
        await _context.SaveChangesAsync(cancellationToken);
        return analysis.Id;
    }
}
