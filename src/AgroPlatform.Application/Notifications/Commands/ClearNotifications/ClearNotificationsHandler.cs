using AgroPlatform.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Notifications.Commands.ClearNotifications;

public class ClearNotificationsHandler : IRequestHandler<ClearNotificationsCommand>
{
    private readonly IAppDbContext _context;

    public ClearNotificationsHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task Handle(ClearNotificationsCommand request, CancellationToken cancellationToken)
    {
        await _context.Notifications
            .Where(n => n.IsRead)
            .ExecuteDeleteAsync(cancellationToken);

        await _context.SaveChangesAsync(cancellationToken);
    }
}
