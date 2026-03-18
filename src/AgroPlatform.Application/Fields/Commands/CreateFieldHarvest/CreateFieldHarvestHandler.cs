using AgroPlatform.Application.Common.Exceptions;
using AgroPlatform.Application.Common.Interfaces;
using AgroPlatform.Domain.Fields;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgroPlatform.Application.Fields.Commands.CreateFieldHarvest;

public class CreateFieldHarvestHandler : IRequestHandler<CreateFieldHarvestCommand, Guid>
{
    private readonly IAppDbContext _context;

    public CreateFieldHarvestHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<Guid> Handle(CreateFieldHarvestCommand request, CancellationToken cancellationToken)
    {
        var field = await _context.Fields
            .FirstOrDefaultAsync(f => f.Id == request.FieldId, cancellationToken)
            ?? throw new NotFoundException(nameof(Field), request.FieldId);

        var harvest = new FieldHarvest
        {
            FieldId = request.FieldId,
            Year = request.Year,
            CropName = request.CropName,
            TotalTons = request.TotalTons,
            MoisturePercent = request.MoisturePercent,
            PricePerTon = request.PricePerTon,
            HarvestDate = request.HarvestDate,
            Notes = request.Notes,
        };

        harvest.YieldTonsPerHa = field.AreaHectares > 0
            ? Math.Round(request.TotalTons / field.AreaHectares, 2)
            : null;

        harvest.TotalRevenue = request.PricePerTon.HasValue
            ? request.TotalTons * request.PricePerTon.Value
            : null;

        _context.FieldHarvests.Add(harvest);
        await _context.SaveChangesAsync(cancellationToken);
        return harvest.Id;
    }
}
