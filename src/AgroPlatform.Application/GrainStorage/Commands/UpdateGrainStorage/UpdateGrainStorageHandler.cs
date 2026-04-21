using AgroPlatform.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.GrainStorage.Commands.UpdateGrainStorage;

public class UpdateGrainStorageHandler : IRequestHandler<UpdateGrainStorageCommand>
{
    private readonly IAppDbContext _context;

    public UpdateGrainStorageHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task Handle(UpdateGrainStorageCommand request, CancellationToken cancellationToken)
    {
        var storage = await _context.GrainStorages
            .FirstOrDefaultAsync(s => s.Id == request.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"GrainStorage {request.Id} not found.");

        storage.Name = request.Name;
        storage.Code = request.Code;
        storage.Location = request.Location;
        storage.StorageType = request.StorageType;
        storage.CapacityTons = request.CapacityTons;
        storage.IsActive = request.IsActive;
        storage.Notes = request.Notes;

        await _context.SaveChangesAsync(cancellationToken);
    }
}
