using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Machinery;
using MediatR;

namespace AgroPlatform.Application.Machinery.Commands.DeleteMachine;

public class DeleteMachineHandler : IRequestHandler<DeleteMachineCommand>
{
    private readonly IAppDbContext _context;

    public DeleteMachineHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task Handle(DeleteMachineCommand request, CancellationToken cancellationToken)
    {
        var machine = await _context.Machines.FindAsync(new object[] { request.Id }, cancellationToken)
            ?? throw new NotFoundException(nameof(Machine), request.Id);

        machine.IsDeleted = true;
        machine.DeletedAtUtc = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
    }
}
