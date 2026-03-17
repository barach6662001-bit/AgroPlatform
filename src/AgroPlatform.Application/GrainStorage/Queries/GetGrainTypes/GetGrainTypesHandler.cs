using AgroPlatform.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.GrainStorage.Queries.GetGrainTypes;

public class GetGrainTypesHandler : IRequestHandler<GetGrainTypesQuery, IReadOnlyList<string>>
{
    private readonly IAppDbContext _context;

    public GetGrainTypesHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<string>> Handle(GetGrainTypesQuery request, CancellationToken cancellationToken)
    {
        var types = await _context.GrainTypes
            .OrderBy(g => !g.IsDefault)
            .ThenBy(g => g.Name)
            .Select(g => g.Name)
            .Distinct()
            .ToListAsync(cancellationToken);

        return types;
    }
}
