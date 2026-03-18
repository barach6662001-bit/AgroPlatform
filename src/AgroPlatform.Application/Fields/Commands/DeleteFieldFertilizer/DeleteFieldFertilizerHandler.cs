using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Fields;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Fields.Commands.DeleteFieldFertilizer;

public class DeleteFieldFertilizerHandler : IRequestHandler<DeleteFieldFertilizerCommand>
{
    private readonly IAppDbContext _context;

    public DeleteFieldFertilizerHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task Handle(DeleteFieldFertilizerCommand request, CancellationToken cancellationToken)
    {
        var fertilizer = await _context.FieldFertilizers
            .FirstOrDefaultAsync(f => f.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(FieldFertilizer), request.Id);

        _context.FieldFertilizers.Remove(fertilizer);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
