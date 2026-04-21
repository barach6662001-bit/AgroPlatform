using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Warehouses;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Warehouses.Commands.CreateWarehouseItem;

public class CreateWarehouseItemHandler : IRequestHandler<CreateWarehouseItemCommand, Guid>
{
    private readonly IAppDbContext _context;

    public CreateWarehouseItemHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateWarehouseItemCommand request, CancellationToken cancellationToken)
    {
        var codeExists = await _context.WarehouseItems
            .AnyAsync(i => i.Code == request.Code, cancellationToken);

        if (codeExists)
            throw new ConflictException($"A warehouse item with code '{request.Code}' already exists.");

        var item = new WarehouseItem
        {
            Name = request.Name,
            Code = request.Code,
            Category = request.Category,
            BaseUnit = request.BaseUnit,
            Description = request.Description,
            MinimumQuantity = request.MinimumQuantity,
            PurchasePrice = request.PurchasePrice
        };

        _context.WarehouseItems.Add(item);
        await _context.SaveChangesAsync(cancellationToken);
        return item.Id;
    }
}
