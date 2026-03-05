using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.AgroOperations;
using MediatR;

namespace AgroPlatform.Application.AgroOperations.Commands.DeleteAgroOperation;

public class DeleteAgroOperationHandler : IRequestHandler<DeleteAgroOperationCommand>
{
    private readonly IAppDbContext _context;

    public DeleteAgroOperationHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task Handle(DeleteAgroOperationCommand request, CancellationToken cancellationToken)
    {
        var operation = await _context.AgroOperations.FindAsync(new object[] { request.Id }, cancellationToken)
            ?? throw new NotFoundException(nameof(AgroOperation), request.Id);

        _context.AgroOperations.Remove(operation);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
