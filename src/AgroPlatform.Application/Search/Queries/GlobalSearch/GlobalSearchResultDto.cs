namespace AgroPlatform.Application.Search.Queries.GlobalSearch;

public class GlobalSearchResultDto
{
    public string Type { get; set; } = string.Empty;
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Subtitle { get; set; }
    public string Url { get; set; } = string.Empty;
}
