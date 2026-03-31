using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Enums;
using AgroPlatform.Domain.Warehouses;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Warehouses.Commands.SubmitInventorySession;

public class SubmitInventorySessionHandler : IRequestHandler<SubmitInventorySessionCommand>
{
    private readonly IAppDbContext _context;

    public SubmitInventorySessionHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task Handle(SubmitInventorySessionCommand request, CancellationToken cancellationToken)
    {
        var session = await _context.InventorySessions
            .Include(s => s.Lines)
            .FirstOrDefaultAsync(s => s.Id == request.SessionId, cancellationToken)
            ?? throw new NotFoundException(nameof(InventorySession), request.SessionId);

        if (session.Status != InventorySessionStatus.InProgress)
            throw new ConflictException("Only InProgress sessions can be submitted.");

        if (session.Lines.Any(l => !l.IsCountRecorded))
            throw new ConflictException("All inventory lines must be counted before submitting.");

        session.Status = InventorySessionStatus.PendingApproval;
        await _context.SaveChangesAsync(cancellationToken);
    }
}
