using AgroPlatform.Application.Common.Interfaces;
using MediatR;

namespace AgroPlatform.Application.Warehouses.Commands.IssueStock;

public class IssueStockHandler : IRequestHandler<IssueStockCommand, Guid>
{
    private readonly IAppDbContext _context;

    public IssueStockHandler(IAppDbContext context)
    {
        _context = context;
    }

    public Task<Guid> Handle(IssueStockCommand request, CancellationToken cancellationToken)
    {
        // TODO: Implement
        throw new NotImplementedException();
    }
}
