using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Enums;
using AgroPlatform.Domain.Warehouses;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Warehouses.Commands.ApproveInventorySession;

public class ApproveInventorySessionHandler : IRequestHandler<ApproveInventorySessionCommand>
{
    private readonly IAppDbContext _context;

    public ApproveInventorySessionHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task Handle(ApproveInventorySessionCommand request, CancellationToken cancellationToken)
    {
        var session = await _context.InventorySessions
            .FirstOrDefaultAsync(s => s.Id == request.SessionId, cancellationToken)
            ?? throw new NotFoundException(nameof(InventorySession), request.SessionId);

        if (session.Status != InventorySessionStatus.PendingApproval)
            throw new ConflictException("Only PendingApproval sessions can be approved.");

        session.Status = InventorySessionStatus.Approved;
        await _context.SaveChangesAsync(cancellationToken);
    }
}
