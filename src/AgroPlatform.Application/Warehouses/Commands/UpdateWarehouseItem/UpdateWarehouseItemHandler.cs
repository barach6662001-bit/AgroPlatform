using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Warehouses;
using MediatR;
using Microsoft.EntityFrameworkCore;

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

        var codeExists = await _context.WarehouseItems
            .AnyAsync(i => i.Code == request.Code && i.Id != request.Id, cancellationToken);

        if (codeExists)
            throw new ConflictException($"A warehouse item with code '{request.Code}' already exists.");

        item.Name = request.Name;
        item.Code = request.Code;
        item.Category = request.Category;
        item.BaseUnit = request.BaseUnit;
        item.Description = request.Description;
        item.MinimumQuantity = request.MinimumQuantity;
        item.PurchasePrice = request.PurchasePrice;

        await _context.SaveChangesAsync(cancellationToken);
    }
}
