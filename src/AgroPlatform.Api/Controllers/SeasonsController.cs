using AgroPlatform.Application.Common.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Api.Controllers;

[ApiController]
[Route("api/seasons")]
[Authorize]
[Produces("application/json")]
public sealed class SeasonsController : ControllerBase
{
    private readonly IAppDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public SeasonsController(IAppDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    [HttpGet]
    [ProducesResponseType(typeof(List<int>), StatusCodes.Status200OK)]
    public async Task<IActionResult> List(CancellationToken cancellationToken)
    {
        var tenantId = _currentUser.TenantId;

        var operationYears = await _db.AgroOperations
            .Where(x => x.TenantId == tenantId && !x.IsDeleted)
            .Select(x => (x.CompletedDate ?? x.PlannedDate).Year)
            .ToListAsync(cancellationToken);

        var costYears = await _db.CostRecords
            .Where(x => x.TenantId == tenantId && !x.IsDeleted)
            .Select(x => x.Date.Year)
            .ToListAsync(cancellationToken);

        var salesYears = await _db.Sales
            .Where(x => x.TenantId == tenantId && !x.IsDeleted)
            .Select(x => x.Date.Year)
            .ToListAsync(cancellationToken);

        var years = operationYears
            .Concat(costYears)
            .Concat(salesYears)
            .Distinct()
            .OrderBy(y => y)
            .ToList();

        return Ok(years);
    }
}
