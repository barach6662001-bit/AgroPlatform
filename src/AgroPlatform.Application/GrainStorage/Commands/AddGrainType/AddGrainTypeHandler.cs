using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.GrainStorage;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.GrainStorage.Commands.AddGrainType;

public class AddGrainTypeHandler : IRequestHandler<AddGrainTypeCommand, Guid>
{
    private readonly IAppDbContext _context;
    private readonly ITenantService _tenantService;

    public AddGrainTypeHandler(IAppDbContext context, ITenantService tenantService)
    {
        _context = context;
        _tenantService = tenantService;
    }

    public async Task<Guid> Handle(AddGrainTypeCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetTenantId();

        var exists = await _context.GrainTypes
            .AnyAsync(g => g.Name == request.Name, cancellationToken);

        if (exists)
            throw new ConflictException($"A grain type with name '{request.Name}' already exists.");

        var grainType = new GrainType
        {
            Name = request.Name,
            IsDefault = false,
            TenantId = tenantId,
        };

        _context.GrainTypes.Add(grainType);
        await _context.SaveChangesAsync(cancellationToken);
        return grainType.Id;
    }
}
