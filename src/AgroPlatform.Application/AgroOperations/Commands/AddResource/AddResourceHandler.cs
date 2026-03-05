using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.AgroOperations;
using AgroPlatform.Domain.Warehouses;
using MediatR;

namespace AgroPlatform.Application.AgroOperations.Commands.AddResource;

public class AddResourceHandler : IRequestHandler<AddResourceCommand, Guid>
{
    private readonly IAppDbContext _context;

    public AddResourceHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(AddResourceCommand request, CancellationToken cancellationToken)
    {
        _ = await _context.AgroOperations.FindAsync(new object[] { request.AgroOperationId }, cancellationToken)
            ?? throw new NotFoundException(nameof(AgroOperation), request.AgroOperationId);

        _ = await _context.WarehouseItems.FindAsync(new object[] { request.WarehouseItemId }, cancellationToken)
            ?? throw new NotFoundException(nameof(WarehouseItem), request.WarehouseItemId);

        var resource = new AgroOperationResource
        {
            AgroOperationId = request.AgroOperationId,
            WarehouseItemId = request.WarehouseItemId,
            WarehouseId = request.WarehouseId,
            PlannedQuantity = request.PlannedQuantity,
            UnitCode = request.UnitCode
        };

        _context.AgroOperationResources.Add(resource);
        await _context.SaveChangesAsync(cancellationToken);
        return resource.Id;
    }
}
