using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Warehouses;
using MediatR;

namespace AgroPlatform.Application.Warehouses.Commands.CreateWarehouse;

public class CreateWarehouseHandler : IRequestHandler<CreateWarehouseCommand, Guid>
{
    private readonly IAppDbContext _context;

    public CreateWarehouseHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateWarehouseCommand request, CancellationToken cancellationToken)
    {
        var warehouse = new Warehouse
        {
            Name = request.Name,
            Location = request.Location,
            IsActive = true
        };

        _context.Warehouses.Add(warehouse);
        await _context.SaveChangesAsync(cancellationToken);
        return warehouse.Id;
    }
}
