using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.HR.Commands.DeleteWorkLog;

public class DeleteWorkLogHandler : IRequestHandler<DeleteWorkLogCommand>
{
    private readonly IAppDbContext _context;

    public DeleteWorkLogHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task Handle(DeleteWorkLogCommand request, CancellationToken cancellationToken)
    {
        var workLog = await _context.WorkLogs
            .FirstOrDefaultAsync(w => w.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException("WorkLog", request.Id);

        workLog.IsDeleted = true;
        workLog.DeletedAtUtc = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
    }
}
