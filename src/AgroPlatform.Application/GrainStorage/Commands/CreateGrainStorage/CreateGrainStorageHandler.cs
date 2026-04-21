using AgroPlatform.Application.Common.Interfaces;
using MediatR;

namespace AgroPlatform.Application.GrainStorage.Commands.CreateGrainStorage;

public class CreateGrainStorageHandler : IRequestHandler<CreateGrainStorageCommand, Guid>
{
    private readonly IAppDbContext _context;

    public CreateGrainStorageHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateGrainStorageCommand request, CancellationToken cancellationToken)
    {
        var storage = new Domain.GrainStorage.GrainStorage
        {
            Name = request.Name,
            Code = request.Code,
            Location = request.Location,
            StorageType = request.StorageType,
            CapacityTons = request.CapacityTons,
            IsActive = request.IsActive,
            Notes = request.Notes,
        };

        _context.GrainStorages.Add(storage);
        await _context.SaveChangesAsync(cancellationToken);
        return storage.Id;
    }
}
