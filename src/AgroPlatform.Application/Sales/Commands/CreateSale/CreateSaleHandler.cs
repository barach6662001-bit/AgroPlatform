using AgroPlatform.Application.Common.Interfaces;
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
            Notes = request.Notes
        };

        _context.Sales.Add(sale);
        await _context.SaveChangesAsync(cancellationToken);
        return sale.Id;
    }
}
