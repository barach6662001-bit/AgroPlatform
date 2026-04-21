using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Sales;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Sales.Commands.DeleteSale;

public class DeleteSaleHandler : IRequestHandler<DeleteSaleCommand>
{
    private readonly IAppDbContext _context;

    public DeleteSaleHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task Handle(DeleteSaleCommand request, CancellationToken cancellationToken)
    {
        var sale = await _context.Sales.FindAsync(new object[] { request.Id }, cancellationToken)
            ?? throw new NotFoundException(nameof(Sale), request.Id);

        // Remove the linked revenue CostRecord before soft-deleting the sale
        var revenueRecord = await _context.CostRecords
            .FirstOrDefaultAsync(c => c.SaleId == sale.Id, cancellationToken);

        if (revenueRecord != null)
            _context.CostRecords.Remove(revenueRecord);

        _context.Sales.Remove(sale);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
