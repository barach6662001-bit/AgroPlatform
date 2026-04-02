using AgroPlatform.Application.Search.Queries.GlobalSearch;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgroPlatform.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/search")]
[Produces("application/json")]
public class SearchController : ControllerBase
{
    private readonly ISender _sender;

    public SearchController(ISender sender)
    {
        _sender = sender;
    }

    [HttpGet]
    public async Task<IActionResult> Search(
        [FromQuery] string q = "",
        CancellationToken cancellationToken = default)
    {
        var results = await _sender.Send(new GlobalSearchQuery(q), cancellationToken);
        return Ok(results);
    }
}
