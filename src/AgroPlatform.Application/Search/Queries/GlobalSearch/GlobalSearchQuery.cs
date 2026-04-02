using MediatR;

namespace AgroPlatform.Application.Search.Queries.GlobalSearch;

public record GlobalSearchQuery(string Term) : IRequest<List<GlobalSearchResultDto>>;
