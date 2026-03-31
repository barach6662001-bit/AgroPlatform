namespace AgroPlatform.Application.Warehouses.Queries.GetItemCategories;

public class ItemCategoryDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Code { get; set; }
    public Guid? ParentId { get; set; }
}
