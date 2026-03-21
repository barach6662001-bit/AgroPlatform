using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Sales;
using MediatR;

namespace AgroPlatform.Application.Sales.Commands.UpdateSale;

public class UpdateSaleHandler : IRequestHandler<UpdateSaleCommand>
{
    private readonly IAppDbContext _context;

    public UpdateSaleHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task Handle(UpdateSaleCommand request, CancellationToken cancellationToken)
    {
        var sale = await _context.Sales.FindAsync(new object[] { request.Id }, cancellationToken)
            ?? throw new NotFoundException(nameof(Sale), request.Id);

        sale.Date = request.Date;
        sale.BuyerName = request.BuyerName;
        sale.Product = request.Product;
        sale.Quantity = request.Quantity;
        sale.Unit = request.Unit;
        sale.PricePerUnit = request.PricePerUnit;
        sale.TotalAmount = request.Quantity * request.PricePerUnit;
        sale.Currency = request.Currency;
        sale.FieldId = request.FieldId;
        sale.Notes = request.Notes;

        await _context.SaveChangesAsync(cancellationToken);
    }
}
