using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Economics;
using AgroPlatform.Domain.Enums;
using AgroPlatform.Domain.Sales;
using MediatR;

namespace AgroPlatform.Application.Sales.Commands.CreateSale;

public class CreateSaleHandler : IRequestHandler<CreateSaleCommand, Guid>
{
    private readonly IAppDbContext _context;

    public CreateSaleHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateSaleCommand request, CancellationToken cancellationToken)
    {
        var sale = new Sale
        {
            Date = request.Date,
            BuyerName = request.BuyerName,
            Product = request.Product,
            Quantity = request.Quantity,
            Unit = request.Unit,
            PricePerUnit = request.PricePerUnit,
            TotalAmount = request.Quantity * request.PricePerUnit,
            Currency = request.Currency,
            FieldId = request.FieldId,
            Notes = request.Notes,
            GrainMovementId = request.GrainMovementId
        };

        _context.Sales.Add(sale);

        // Always create a revenue CostRecord so that economics (field P&L, marginality, etc.)
        // reflect this sale. Amount is negative = income/revenue.
        // If the sale is also linked to a GrainMovement that already created its own CostRecord
        // (from the grain-dispatch workflow), the caller must not record the same dispatch both
        // as a priced movement and as a Sale — that would double-count revenue (known constraint).
        _context.CostRecords.Add(new CostRecord
        {
            Category = CostCategory.Other,
            Amount = -sale.TotalAmount,
            Currency = sale.Currency,
            Date = sale.Date,
            FieldId = sale.FieldId,
            SaleId = sale.Id,
            Description = $"Продаж: {sale.Product}, {sale.Quantity:F2} {sale.Unit} × {sale.PricePerUnit:F0} {sale.Currency}/од.",
        });

        await _context.SaveChangesAsync(cancellationToken);
        return sale.Id;
    }
}
