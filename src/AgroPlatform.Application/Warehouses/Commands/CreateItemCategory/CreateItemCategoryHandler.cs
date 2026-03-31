using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Warehouses;
using MediatR;

namespace AgroPlatform.Application.Warehouses.Commands.CreateItemCategory;

public class CreateItemCategoryHandler : IRequestHandler<CreateItemCategoryCommand, Guid>
{
    private readonly IAppDbContext _context;

    public CreateItemCategoryHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateItemCategoryCommand request, CancellationToken cancellationToken)
    {
        if (request.ParentId.HasValue)
        {
            var parent = await _context.ItemCategories.FindAsync(new object[] { request.ParentId.Value }, cancellationToken)
                ?? throw new NotFoundException(nameof(ItemCategory), request.ParentId.Value);
        }

        var category = new ItemCategory
        {
            Name = request.Name,
            Code = request.Code,
            ParentId = request.ParentId
        };

        _context.ItemCategories.Add(category);
        await _context.SaveChangesAsync(cancellationToken);

        return category.Id;
    }
}
