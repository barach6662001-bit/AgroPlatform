using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Warehouses;
using MediatR;

namespace AgroPlatform.Application.Warehouses.Commands.UpdateWarehouseItem;

public class UpdateWarehouseItemHandler : IRequestHandler<UpdateWarehouseItemCommand>
{
    private readonly IAppDbContext _context;

    public UpdateWarehouseItemHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task Handle(UpdateWarehouseItemCommand request, CancellationToken cancellationToken)
    {
        var item = await _context.WarehouseItems.FindAsync(new object[] { request.Id }, cancellationToken)
            ?? throw new NotFoundException(nameof(WarehouseItem), request.Id);

        item.Name = request.Name;
        item.Description = request.Description;

        await _context.SaveChangesAsync(cancellationToken);
    }
}
