using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.GrainStorage;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.GrainStorage.Commands.SplitGrainBatch;

public class SplitGrainBatchHandler : IRequestHandler<SplitGrainBatchCommand, SplitGrainBatchResultDto>
{
    private readonly IAppDbContext _context;

    public SplitGrainBatchHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<SplitGrainBatchResultDto> Handle(SplitGrainBatchCommand request, CancellationToken cancellationToken)
    {
        var sourceBatch = await _context.GrainBatches
            .FirstOrDefaultAsync(b => b.Id == request.SourceBatchId, cancellationToken)
            ?? throw new NotFoundException(nameof(GrainBatch), request.SourceBatchId);

        var totalSplitQty = request.Targets.Sum(t => t.QuantityTons);

        if (totalSplitQty > sourceBatch.QuantityTons)
            throw new ConflictException(
                $"Cannot split {totalSplitQty:F4} t: only {sourceBatch.QuantityTons:F4} t available in source batch.");

        var targetStorageIds = request.Targets.Select(t => t.TargetStorageId).Distinct().ToList();
        var targetStorages = await _context.GrainStorages
            .Where(s => targetStorageIds.Contains(s.Id))
            .ToListAsync(cancellationToken);

        foreach (var target in request.Targets)
        {
            var storage = targetStorages.FirstOrDefault(s => s.Id == target.TargetStorageId)
                ?? throw new NotFoundException(nameof(Domain.GrainStorage.GrainStorage), target.TargetStorageId);

            if (!storage.IsActive)
                throw new ConflictException(
                    $"Target storage '{storage.Name}' is inactive and cannot accept grain.");
        }

        // Reduce source batch
        sourceBatch.QuantityTons -= totalSplitQty;

        // Record the outbound movement on the source batch
        _context.GrainMovements.Add(new GrainMovement
        {
            GrainBatchId = sourceBatch.Id,
            MovementType = "Out",
            QuantityTons = totalSplitQty,
            MovementDate = DateTime.UtcNow,
            Reason = "Split",
            Notes = request.Notes,
        });

        var createdBatches = new List<SplitResultItem>();

        foreach (var target in request.Targets)
        {
            var storage = targetStorages.First(s => s.Id == target.TargetStorageId);

            var newBatch = new GrainBatch
            {
                GrainType = sourceBatch.GrainType,
                QuantityTons = target.QuantityTons,
                InitialQuantityTons = target.QuantityTons,
                OwnershipType = sourceBatch.OwnershipType,
                OwnerName = sourceBatch.OwnerName,
                ContractNumber = sourceBatch.ContractNumber,
                PricePerTon = sourceBatch.PricePerTon,
                ReceivedDate = sourceBatch.ReceivedDate,
                SourceFieldId = sourceBatch.SourceFieldId,
                MoisturePercent = sourceBatch.MoisturePercent,
                Notes = request.Notes,
            };

            _context.GrainBatches.Add(newBatch);
            _context.GrainBatchPlacements.Add(new GrainBatchPlacement
            {
                GrainBatchId = newBatch.Id,
                GrainStorageId = target.TargetStorageId,
                QuantityTons = target.QuantityTons,
            });

            // EF Core assigns the Id immediately upon Add; add the inbound movement now
            _context.GrainMovements.Add(new GrainMovement
            {
                GrainBatchId = newBatch.Id,
                MovementType = "In",
                QuantityTons = target.QuantityTons,
                MovementDate = DateTime.UtcNow,
                Reason = "Split",
                Notes = request.Notes,
            });

            createdBatches.Add(new SplitResultItem
            {
                NewBatchId = newBatch.Id,
                TargetStorageId = target.TargetStorageId,
                TargetStorageName = storage.Name,
                QuantityTons = target.QuantityTons,
            });
        }

        await _context.SaveChangesAsync(cancellationToken);

        return new SplitGrainBatchResultDto
        {
            SourceBatchId = sourceBatch.Id,
            RemainingQuantityTons = sourceBatch.QuantityTons,
            CreatedBatches = createdBatches,
        };
    }
}
