using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Economics;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Economics.Commands.UpdateSale;

public class UpdateSaleHandler : IRequestHandler<UpdateSaleCommand>
{
    private readonly IAppDbContext _context;

    public UpdateSaleHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task Handle(UpdateSaleCommand request, CancellationToken cancellationToken)
    {
        var sale = await _context.Sales
            .FirstOrDefaultAsync(s => s.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Sale), request.Id);

        sale.BuyerName = request.BuyerName;
        sale.ContractNumber = request.ContractNumber;
        sale.CropType = request.CropType;
        sale.QuantityTons = request.QuantityTons;
        sale.PricePerTon = request.PricePerTon;
        sale.TotalAmount = request.QuantityTons * request.PricePerTon;
        sale.SaleDate = request.SaleDate;
        sale.PaymentStatus = request.PaymentStatus;

        await _context.SaveChangesAsync(cancellationToken);
    }
}
