using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.AgroOperations;
using MediatR;

namespace AgroPlatform.Application.AgroOperations.Commands.RemoveMachinery;

public class RemoveMachineryHandler : IRequestHandler<RemoveMachineryCommand>
{
    private readonly IAppDbContext _context;

    public RemoveMachineryHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task Handle(RemoveMachineryCommand request, CancellationToken cancellationToken)
    {
        var machinery = await _context.AgroOperationMachineries.FindAsync(new object[] { request.MachineryId }, cancellationToken)
            ?? throw new NotFoundException(nameof(AgroOperationMachinery), request.MachineryId);

        _context.AgroOperationMachineries.Remove(machinery);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
