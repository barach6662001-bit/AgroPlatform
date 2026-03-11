using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Fields;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Fields.Commands.CreateField;

public class CreateFieldHandler : IRequestHandler<CreateFieldCommand, Guid>
{
    private readonly IAppDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public CreateFieldHandler(IAppDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Guid> Handle(CreateFieldCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _currentUser.TenantId;

        // Check for duplicate name within the tenant (including soft-deleted records,
        // because the unique DB index covers all rows regardless of IsDeleted).
        var nameExists = await _context.Fields
            .IgnoreQueryFilters()
            .AnyAsync(f => f.Name == request.Name && f.TenantId == tenantId, cancellationToken);

        if (nameExists)
            throw new ConflictException($"Поле з назвою '{request.Name}' вже існує.");

        var field = new Field
        {
            Name = request.Name,
            CadastralNumber = request.CadastralNumber,
            AreaHectares = request.AreaHectares,
            CurrentCrop = request.CurrentCrop,
            CurrentCropYear = request.CurrentCropYear,
            GeoJson = request.GeoJson,
            SoilType = request.SoilType,
            Notes = request.Notes
        };

        _context.Fields.Add(field);
        await _context.SaveChangesAsync(cancellationToken);
        return field.Id;
    }
}
