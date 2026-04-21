using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Fields;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Fields.Commands.DeleteSoilAnalysis;

public class DeleteSoilAnalysisHandler : IRequestHandler<DeleteSoilAnalysisCommand>
{
    private readonly IAppDbContext _context;

    public DeleteSoilAnalysisHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task Handle(DeleteSoilAnalysisCommand request, CancellationToken cancellationToken)
    {
        var analysis = await _context.SoilAnalyses
            .FirstOrDefaultAsync(s => s.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(SoilAnalysis), request.Id);

        if (analysis.FieldId != request.FieldId)
            throw new NotFoundException(nameof(SoilAnalysis), request.Id);

        _context.SoilAnalyses.Remove(analysis);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
