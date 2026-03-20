using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Economics;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Economics.Commands.DeleteSale;

public class DeleteSaleHandler : IRequestHandler<DeleteSaleCommand>
{
    private readonly IAppDbContext _context;

    public DeleteSaleHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task Handle(DeleteSaleCommand request, CancellationToken cancellationToken)
    {
        var sale = await _context.Sales
            .FirstOrDefaultAsync(s => s.Id == request.Id, cancellationToken)
            ?? throw new NotFoundException(nameof(Sale), request.Id);

        _context.Sales.Remove(sale);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
