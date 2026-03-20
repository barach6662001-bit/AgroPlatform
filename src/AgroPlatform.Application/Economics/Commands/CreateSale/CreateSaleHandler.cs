using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Economics;
using AgroPlatform.Domain.GrainStorage;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Economics.Commands.CreateSale;

public class CreateSaleHandler : IRequestHandler<CreateSaleCommand, Guid>
{
    private readonly IAppDbContext _context;

    public CreateSaleHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateSaleCommand request, CancellationToken cancellationToken)
    {
        var totalAmount = request.QuantityTons * request.PricePerTon;

        var sale = new Sale
        {
            BuyerName = request.BuyerName,
            ContractNumber = request.ContractNumber,
            CropType = request.CropType,
            QuantityTons = request.QuantityTons,
            PricePerTon = request.PricePerTon,
            TotalAmount = totalAmount,
            SaleDate = request.SaleDate,
            PaymentStatus = request.PaymentStatus,
            GrainBatchId = request.GrainBatchId,
        };

        _context.Sales.Add(sale);

        // Auto-create GrainMovement "Out" if a batch is specified
        if (request.GrainBatchId.HasValue)
        {
            var batch = await _context.GrainBatches
                .FirstOrDefaultAsync(b => b.Id == request.GrainBatchId.Value, cancellationToken)
                ?? throw new NotFoundException(nameof(GrainBatch), request.GrainBatchId.Value);

            var movement = new GrainMovement
            {
                GrainBatchId = request.GrainBatchId.Value,
                MovementType = "Out",
                QuantityTons = request.QuantityTons,
                MovementDate = request.SaleDate,
                Reason = "Sale",
                Notes = $"Продаж: {request.BuyerName}" + (request.ContractNumber != null ? $", Договір №{request.ContractNumber}" : string.Empty),
                PricePerTon = request.PricePerTon,
                TotalRevenue = totalAmount,
            };

            _context.GrainMovements.Add(movement);
            batch.QuantityTons -= request.QuantityTons;
        }

        // Auto-create CostRecord "Revenue"
        _context.CostRecords.Add(new CostRecord
        {
            Category = "Revenue",
            Amount = -totalAmount, // Negative = income
            Currency = "UAH",
            Date = request.SaleDate,
            Description = $"Продаж {request.CropType}: {request.QuantityTons:F2}т × {request.PricePerTon:F0} UAH/т → {request.BuyerName}",
        });

        await _context.SaveChangesAsync(cancellationToken);
        return sale.Id;
    }
}
