using MediatR;

namespace AgroPlatform.Application.Warehouses.Queries.GetItemCategories;

public record GetItemCategoriesQuery : IRequest<List<ItemCategoryDto>>;
