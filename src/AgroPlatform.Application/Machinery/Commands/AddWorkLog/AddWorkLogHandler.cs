using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Machinery;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Machinery.Commands.AddWorkLog;

public class AddWorkLogHandler : IRequestHandler<AddWorkLogCommand, Guid>
{
    private readonly IAppDbContext _context;

    public AddWorkLogHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(AddWorkLogCommand request, CancellationToken cancellationToken)
    {
        if (!await _context.Machines.AnyAsync(m => m.Id == request.MachineId, cancellationToken))
            throw new NotFoundException(nameof(Machine), request.MachineId);

        var workLog = new MachineWorkLog
        {
            MachineId = request.MachineId,
            Date = request.Date,
            HoursWorked = request.HoursWorked,
            AgroOperationId = request.AgroOperationId,
            Description = request.Description
        };

        _context.MachineWorkLogs.Add(workLog);
        await _context.SaveChangesAsync(cancellationToken);
        return workLog.Id;
    }
}
