using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.GrainStorage;
using MediatR;

namespace AgroPlatform.Application.GrainStorage.Commands.CreateGrainBatch;

public class CreateGrainBatchHandler : IRequestHandler<CreateGrainBatchCommand, Guid>
{
    private readonly IAppDbContext _context;

    public CreateGrainBatchHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateGrainBatchCommand request, CancellationToken cancellationToken)
    {
        var batch = new GrainBatch
        {
            GrainStorageId = request.GrainStorageId,
            GrainType = request.GrainType,
            QuantityTons = request.QuantityTons,
            InitialQuantityTons = request.QuantityTons,
            OwnershipType = request.OwnershipType,
            OwnerName = request.OwnerName,
            ContractNumber = request.ContractNumber,
            PricePerTon = request.PricePerTon,
            ReceivedDate = request.ReceivedDate,
            Notes = request.Notes,
        };

        _context.GrainBatches.Add(batch);
        await _context.SaveChangesAsync(cancellationToken);
        return batch.Id;
    }
}
