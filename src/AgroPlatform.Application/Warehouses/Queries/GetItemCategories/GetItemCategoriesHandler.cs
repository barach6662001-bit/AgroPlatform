using AgroPlatform.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Warehouses.Queries.GetItemCategories;

public class GetItemCategoriesHandler : IRequestHandler<GetItemCategoriesQuery, List<ItemCategoryDto>>
{
    private readonly IAppDbContext _context;

    public GetItemCategoriesHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<List<ItemCategoryDto>> Handle(GetItemCategoriesQuery request, CancellationToken cancellationToken)
    {
        return await _context.ItemCategories
            .OrderBy(c => c.Name)
            .Select(c => new ItemCategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                Code = c.Code,
                ParentId = c.ParentId
            })
            .ToListAsync(cancellationToken);
    }
}
