using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Economics;
using AgroPlatform.Domain.Enums;
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
            QuantityTons = Math.Abs(request.QuantityTons),
            MovementDate = request.MovementDate,
            Reason = request.Reason,
            Notes = request.Notes,
            PricePerTon = request.PricePerTon,
            BuyerName = request.BuyerName,
        };

        bool isIncoming = request.MovementType is GrainMovementType.Receipt or GrainMovementType.Merge;
        bool isOutgoing = request.MovementType is GrainMovementType.Issue or GrainMovementType.SaleDispatch or GrainMovementType.WriteOff;

        if (request.MovementType == GrainMovementType.Adjustment)
        {
            // Adjustment quantity may be signed; positive = increase, negative = decrease
            var signed = request.QuantityTons;
            movement.QuantityTons = Math.Abs(signed);
            batch.Adjust(signed);
        }
        else if (isIncoming)
        {
            batch.IncreaseQuantity(movement.QuantityTons);
        }
        else if (isOutgoing)
        {
            batch.ReduceQuantity(movement.QuantityTons);
        }

        if (request.MovementType == GrainMovementType.SaleDispatch && request.PricePerTon.HasValue)
            movement.TotalRevenue = movement.QuantityTons * request.PricePerTon.Value;

        _context.GrainMovements.Add(movement);

        // Auto-create revenue record for grain sales
        if (movement.TotalRevenue.HasValue && movement.TotalRevenue > 0)
        {
            _context.CostRecords.Add(new CostRecord
            {
                Category = CostCategory.Other,
                Amount = -movement.TotalRevenue.Value, // Negative = income (revenue)
                Currency = "UAH",
                Date = request.MovementDate,
                FieldId = batch.SourceFieldId,
                Description = $"Продаж зерна: {movement.QuantityTons:F2}т × {request.PricePerTon ?? 0:F0} UAH/т"
            });
        }

        await _context.SaveChangesAsync(cancellationToken);

        if (isIncoming && batch.SourceFieldId.HasValue)
        {
            var field = await _context.Fields.FindAsync(new object[] { batch.SourceFieldId.Value }, cancellationToken);

            var harvest = await _context.FieldHarvests
                .FirstOrDefaultAsync(h =>
                    (h.GrainBatchId == batch.Id ||
                    (h.FieldId == batch.SourceFieldId && h.Year == request.MovementDate.Year)) &&
                    !h.IsDeleted, cancellationToken);

            if (harvest != null)
            {
                harvest.TotalTons += movement.QuantityTons;
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
