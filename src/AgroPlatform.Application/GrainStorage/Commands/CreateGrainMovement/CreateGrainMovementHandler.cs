using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Economics;
using AgroPlatform.Domain.GrainStorage;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.GrainStorage.Commands.CreateGrainMovement;

public class CreateGrainMovementHandler : IRequestHandler<CreateGrainMovementCommand, Guid>
{
    private readonly IAppDbContext _context;

    public CreateGrainMovementHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateGrainMovementCommand request, CancellationToken cancellationToken)
    {
        var batch = await _context.GrainBatches
            .FirstOrDefaultAsync(b => b.Id == request.GrainBatchId, cancellationToken)
            ?? throw new NotFoundException(nameof(GrainBatch), request.GrainBatchId);

        var movement = new GrainMovement
        {
            GrainBatchId = request.GrainBatchId,
            MovementType = request.MovementType,
            QuantityTons = request.QuantityTons,
            MovementDate = request.MovementDate,
            Reason = request.Reason,
            Notes = request.Notes,
            PricePerTon = request.PricePerTon,
            BuyerName = request.BuyerName,
        };

        if (request.MovementType == "Out" && request.PricePerTon.HasValue)
            movement.TotalRevenue = request.QuantityTons * request.PricePerTon.Value;

        _context.GrainMovements.Add(movement);

        if (request.MovementType == "In")
            batch.QuantityTons += request.QuantityTons;
        else if (request.MovementType == "Out")
            batch.QuantityTons -= request.QuantityTons;

        // Auto-create revenue record for grain sales
        if (request.MovementType == "Out" && movement.TotalRevenue.HasValue && movement.TotalRevenue > 0)
        {
            _context.CostRecords.Add(new CostRecord
            {
                Category = "Revenue",
                Amount = -movement.TotalRevenue.Value, // Negative = income (revenue)
                Currency = "UAH",
                Date = request.MovementDate,
                FieldId = batch.SourceFieldId,
                Description = $"Продаж зерна: {request.QuantityTons:F2}т × {request.PricePerTon ?? 0:F0} UAH/т"
            });
        }

        await _context.SaveChangesAsync(cancellationToken);

        if (request.MovementType == "In" && batch.SourceFieldId.HasValue)
        {
            var field = await _context.Fields.FindAsync(new object[] { batch.SourceFieldId.Value }, cancellationToken);

            // Find harvest by batch ID first, then fall back to field+year match
            var harvest = await _context.FieldHarvests
                .FirstOrDefaultAsync(h =>
                    (h.GrainBatchId == batch.Id ||
                    (h.FieldId == batch.SourceFieldId && h.Year == request.MovementDate.Year)) &&
                    !h.IsDeleted, cancellationToken);

            if (harvest != null)
            {
                harvest.TotalTons += request.QuantityTons;
                harvest.YieldTonsPerHa = field?.AreaHectares > 0
                    ? Math.Round(harvest.TotalTons / field.AreaHectares, 2)
                    : null;
                harvest.UpdatedAtUtc = DateTime.UtcNow;
                await _context.SaveChangesAsync(cancellationToken);
            }
        }

        return movement.Id;
    }
}
