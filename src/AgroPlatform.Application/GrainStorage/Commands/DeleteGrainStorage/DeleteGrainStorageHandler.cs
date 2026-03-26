using AgroPlatform.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.GrainStorage.Commands.DeleteGrainStorage;

public class DeleteGrainStorageHandler : IRequestHandler<DeleteGrainStorageCommand>
{
    private readonly IAppDbContext _context;

    public DeleteGrainStorageHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task Handle(DeleteGrainStorageCommand request, CancellationToken cancellationToken)
    {
        var storage = await _context.GrainStorages
            .FirstOrDefaultAsync(s => s.Id == request.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"GrainStorage {request.Id} not found.");

        storage.IsDeleted = true;
        await _context.SaveChangesAsync(cancellationToken);
    }
}
