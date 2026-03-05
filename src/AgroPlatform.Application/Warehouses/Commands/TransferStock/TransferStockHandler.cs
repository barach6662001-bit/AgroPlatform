using AgroPlatform.Application.Common.Interfaces;
using MediatR;

namespace AgroPlatform.Application.Warehouses.Commands.TransferStock;

public class TransferStockHandler : IRequestHandler<TransferStockCommand, Guid>
{
    private readonly IAppDbContext _context;

    public TransferStockHandler(IAppDbContext context)
    {
        _context = context;
    }

    public Task<Guid> Handle(TransferStockCommand request, CancellationToken cancellationToken)
    {
        // TODO: Implement
        throw new NotImplementedException();
    }
}
