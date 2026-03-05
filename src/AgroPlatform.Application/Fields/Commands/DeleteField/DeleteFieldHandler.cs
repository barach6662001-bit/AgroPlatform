using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Fields;
using MediatR;

namespace AgroPlatform.Application.Fields.Commands.DeleteField;

public class DeleteFieldHandler : IRequestHandler<DeleteFieldCommand>
{
    private readonly IAppDbContext _context;

    public DeleteFieldHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task Handle(DeleteFieldCommand request, CancellationToken cancellationToken)
    {
        var field = await _context.Fields.FindAsync(new object[] { request.Id }, cancellationToken)
            ?? throw new NotFoundException(nameof(Field), request.Id);

        _context.Fields.Remove(field);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
