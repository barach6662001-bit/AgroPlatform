using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.AgroOperations;
using MediatR;

namespace AgroPlatform.Application.AgroOperations.Commands.RemoveResource;

public class RemoveResourceHandler : IRequestHandler<RemoveResourceCommand>
{
    private readonly IAppDbContext _context;

    public RemoveResourceHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task Handle(RemoveResourceCommand request, CancellationToken cancellationToken)
    {
        var resource = await _context.AgroOperationResources.FindAsync(new object[] { request.ResourceId }, cancellationToken)
            ?? throw new NotFoundException(nameof(AgroOperationResource), request.ResourceId);

        _context.AgroOperationResources.Remove(resource);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
