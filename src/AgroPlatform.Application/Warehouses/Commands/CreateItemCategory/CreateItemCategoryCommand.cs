using MediatR;

namespace AgroPlatform.Application.Warehouses.Commands.CreateItemCategory;

public record CreateItemCategoryCommand(string Name, string? Code, Guid? ParentId) : IRequest<Guid>;
