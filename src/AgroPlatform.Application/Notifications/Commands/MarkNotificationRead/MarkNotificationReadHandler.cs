using AgroPlatform.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Notifications.Commands.MarkNotificationRead;

public class MarkNotificationReadHandler : IRequestHandler<MarkNotificationReadCommand>
{
    private readonly IAppDbContext _context;

    public MarkNotificationReadHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task Handle(MarkNotificationReadCommand request, CancellationToken cancellationToken)
    {
        if (request.Id.HasValue)
        {
            var n = await _context.Notifications.FindAsync([request.Id.Value], cancellationToken);
            if (n != null) n.IsRead = true;
        }
        else
        {
            await _context.Notifications
                .Where(n => !n.IsRead)
                .ExecuteUpdateAsync(s => s.SetProperty(n => n.IsRead, true), cancellationToken);
        }
        await _context.SaveChangesAsync(cancellationToken);
    }
}
