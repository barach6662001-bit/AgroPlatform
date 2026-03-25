using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.AgroOperations;
using AgroPlatform.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.AgroOperations.Commands.CancelAgroOperation;

public class CancelAgroOperationHandler : IRequestHandler<CancelAgroOperationCommand>
{
    private readonly IAppDbContext _context;

    public CancelAgroOperationHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task Handle(CancelAgroOperationCommand request, CancellationToken cancellationToken)
    {
        var operation = await _context.AgroOperations
            .FirstOrDefaultAsync(o => o.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(AgroOperation), request.Id);

        if (operation.Status == OperationStatus.Completed)
            throw new ConflictException("Completed operations cannot be cancelled.");

        if (operation.Status == OperationStatus.Cancelled)
            throw new ConflictException("Operation is already cancelled.");

        operation.Status = OperationStatus.Cancelled;

        await _context.SaveChangesAsync(cancellationToken);
    }
}
