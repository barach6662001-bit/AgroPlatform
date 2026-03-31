using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Enums;
using AgroPlatform.Domain.Warehouses;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Warehouses.Commands.RecordInventoryCount;

public class RecordInventoryCountHandler : IRequestHandler<RecordInventoryCountCommand>
{
    private readonly IAppDbContext _context;

    public RecordInventoryCountHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task Handle(RecordInventoryCountCommand request, CancellationToken cancellationToken)
    {
        var session = await _context.InventorySessions
            .Include(s => s.Lines)
            .FirstOrDefaultAsync(s => s.Id == request.SessionId, cancellationToken)
            ?? throw new NotFoundException(nameof(InventorySession), request.SessionId);

        if (session.Status != InventorySessionStatus.InProgress)
            throw new ConflictException("Count can only be recorded for sessions with InProgress status.");

        var line = session.Lines.FirstOrDefault(l =>
            l.ItemId == request.ItemId &&
            l.BatchId == request.BatchId)
            ?? throw new NotFoundException($"Line for item {request.ItemId} not found in session {request.SessionId}.");

        line.ActualQuantityBase = request.ActualQuantity;
        line.Note = request.Note;
        line.IsCountRecorded = true;

        await _context.SaveChangesAsync(cancellationToken);
    }
}
