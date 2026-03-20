using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Fields;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Fields.Commands.ReportNdviProblems;

public class ReportNdviProblemsHandler : IRequestHandler<ReportNdviProblemsCommand>
{
    private readonly IAppDbContext _context;
    private readonly INotificationService _notifications;
    private readonly ICurrentUserService _currentUser;

    public ReportNdviProblemsHandler(
        IAppDbContext context,
        INotificationService notifications,
        ICurrentUserService currentUser)
    {
        _context = context;
        _notifications = notifications;
        _currentUser = currentUser;
    }

    public async Task Handle(ReportNdviProblemsCommand request, CancellationToken cancellationToken)
    {
        var field = await _context.Fields
            .FirstOrDefaultAsync(f => f.Id == request.FieldId, cancellationToken)
            ?? throw new NotFoundException(nameof(Field), request.FieldId);

        if (request.ProblemZoneCount > 0)
        {
            await _notifications.SendAsync(
                _currentUser.TenantId,
                "warning",
                "Проблемні зони NDVI",
                $"Виявлено {request.ProblemZoneCount} проблемних зон на полі '{field.Name}'",
                cancellationToken);
        }
    }
}
